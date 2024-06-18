import {
  replaceAttributeRecall,
  replaceAttributeRecallInLegacySurveys,
} from "@/app/api/v1/client/[environmentId]/app/sync/lib/utils";
import { responses } from "@/app/lib/api/response";
import { transformErrorToDetails } from "@/app/lib/api/validator";
import { NextRequest, userAgent } from "next/server";
import { getActionClasses } from "@formbricks/lib/actionClass/service";
import { getAttributes } from "@formbricks/lib/attribute/service";
import { IS_FORMBRICKS_CLOUD } from "@formbricks/lib/constants";
import { getEnvironment } from "@formbricks/lib/environment/service";
import {
  getMonthlyActiveOrganizationPeopleCount,
  getMonthlyOrganizationResponseCount,
  getOrganizationByEnvironmentId,
} from "@formbricks/lib/organization/service";
import { createPerson, getIsPersonMonthlyActive, getPersonByUserId } from "@formbricks/lib/person/service";
import { sendPlanLimitsReachedEventToPosthogWeekly } from "@formbricks/lib/posthogServer";
import { getProductByEnvironmentId } from "@formbricks/lib/product/service";
import { COLOR_DEFAULTS } from "@formbricks/lib/styling/constants";
import { getSyncSurveys, transformToLegacySurvey } from "@formbricks/lib/survey/service";
import { isVersionGreaterThanOrEqualTo } from "@formbricks/lib/utils/version";
import { TLegacySurvey } from "@formbricks/types/LegacySurvey";
import { TEnvironment } from "@formbricks/types/environment";
import { TJsAppLegacyStateSync, TJsAppStateSync, ZJsPeopleUserIdInput } from "@formbricks/types/js";
import { TProduct } from "@formbricks/types/product";
import { TSurvey } from "@formbricks/types/surveys/types";

export const OPTIONS = async (): Promise<Response> => {
  return responses.successResponse({}, true);
};

export const GET = async (
  request: NextRequest,
  {
    params,
  }: {
    params: {
      environmentId: string;
      userId: string;
    };
  }
): Promise<Response> => {
  try {
    const { device } = userAgent(request);
    const version = request.nextUrl.searchParams.get("version");

    // validate using zod

    const inputValidation = ZJsPeopleUserIdInput.safeParse({
      environmentId: params.environmentId,
      userId: params.userId,
    });

    if (!inputValidation.success) {
      return responses.badRequestResponse(
        "Fields are missing or incorrectly formatted",
        transformErrorToDetails(inputValidation.error),
        true
      );
    }

    const { environmentId, userId } = inputValidation.data;

    let environment: TEnvironment | null;

    // check if environment exists
    environment = await getEnvironment(environmentId);
    if (!environment) {
      throw new Error("Environment does not exist");
    }

    // temporary remove the example survey creation to avoid caching issue with multiple example surveys
    /* if (!environment.appSetupCompleted) {
      const exampleTrigger = await getActionClassByEnvironmentIdAndName(environmentId, "New Session");
      if (!exampleTrigger) {
        throw new Error("Example trigger not found");
      }
      const firstSurvey = getExampleAppSurveyTemplate(WEBAPP_URL, exampleTrigger);
      await createSurvey(environmentId, firstSurvey);
      await updateEnvironment(environment.id, { appSetupCompleted: true });
    } */

    // check organization subscriptions
    const organization = await getOrganizationByEnvironmentId(environmentId);

    if (!organization) {
      throw new Error("Organization does not exist");
    }

    // check if MAU limit is reached
    let isMauLimitReached = false;
    let isMonthlyResponsesLimitReached = false;

    if (IS_FORMBRICKS_CLOUD) {
      const currentMau = await getMonthlyActiveOrganizationPeopleCount(organization.id);
      const monthlyResponseLimit = organization.billing.limits.monthly.responses;
      const monthlyMiuLimit = organization.billing.limits.monthly.miu;

      isMauLimitReached = monthlyMiuLimit !== null && currentMau >= monthlyMiuLimit;

      const currentResponseCount = await getMonthlyOrganizationResponseCount(organization.id);
      isMonthlyResponsesLimitReached =
        monthlyResponseLimit !== null && currentResponseCount >= monthlyResponseLimit;
    }

    let person = await getPersonByUserId(environmentId, userId);

    if (isMauLimitReached) {
      // MAU limit reached: check if person has been active this month; only continue if person has been active

      try {
        await sendPlanLimitsReachedEventToPosthogWeekly(environmentId, {
          plan: organization.billing.plan,
          limits: {
            monthly: {
              miu: organization.billing.limits.monthly.miu,
              responses: organization.billing.limits.monthly.responses,
            },
          },
        });
      } catch (err) {
        console.error(`Error sending plan limits reached event to Posthog: ${err}`);
      }

      const errorMessage = `Monthly Active Users limit in the current plan is reached in ${environmentId}`;
      if (!person) {
        // if it's a new person and MAU limit is reached, throw an error
        return responses.tooManyRequestsResponse(
          errorMessage,
          true,
          "public, s-maxage=600, max-age=840, stale-while-revalidate=600, stale-if-error=600"
        );
      }

      // check if person has been active this month
      const isPersonMonthlyActive = await getIsPersonMonthlyActive(person.id);
      if (!isPersonMonthlyActive) {
        return responses.tooManyRequestsResponse(
          errorMessage,
          true,
          "public, s-maxage=600, max-age=840, stale-while-revalidate=600, stale-if-error=600"
        );
      }
    } else {
      // MAU limit not reached: create person if not exists
      if (!person) {
        person = await createPerson(environmentId, userId);
      }
    }

    if (isMonthlyResponsesLimitReached) {
      try {
        await sendPlanLimitsReachedEventToPosthogWeekly(environmentId, {
          plan: organization.billing.plan,
          limits: {
            monthly: {
              miu: organization.billing.limits.monthly.miu,
              responses: organization.billing.limits.monthly.responses,
            },
          },
        });
      } catch (err) {
        console.error(`Error sending plan limits reached event to Posthog: ${err}`);
      }
    }

    const [surveys, actionClasses, product] = await Promise.all([
      getSyncSurveys(environmentId, person.id, device.type === "mobile" ? "phone" : "desktop", {
        version: version ?? undefined,
      }),
      getActionClasses(environmentId),
      getProductByEnvironmentId(environmentId),
    ]);

    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct: TProduct = {
      ...product,
      brandColor: product.styling.brandColor?.light ?? COLOR_DEFAULTS.brandColor,
      ...(product.styling.highlightBorderColor?.light && {
        highlightBorderColor: product.styling.highlightBorderColor.light,
      }),
    };
    const attributes = await getAttributes(person.id);
    const language = attributes["language"];
    const noCodeActionClasses = actionClasses.filter((actionClass) => actionClass.type === "noCode");

    // Scenario 1: Multi language and updated trigger action classes supported.
    // Use the surveys as they are.
    let transformedSurveys: TLegacySurvey[] | TSurvey[] = surveys;

    // creating state object
    let state: TJsAppStateSync | TJsAppLegacyStateSync = {
      surveys: !isMonthlyResponsesLimitReached
        ? transformedSurveys.map((survey) => replaceAttributeRecall(survey, attributes))
        : [],
      actionClasses,
      language,
      product: updatedProduct,
    };

    // Backwards compatibility for versions less than 2.0.0 (no multi-language support and updated trigger action classes).
    if (!isVersionGreaterThanOrEqualTo(version ?? "", "2.0.0")) {
      // Scenario 2: Multi language and updated trigger action classes not supported
      // Convert to legacy surveys with default language
      // convert triggers to array of actionClasses Names
      transformedSurveys = await Promise.all(
        surveys.map((survey: TSurvey | TLegacySurvey) => {
          const languageCode = "default";
          return transformToLegacySurvey(survey as TSurvey, languageCode);
        })
      );

      state = {
        surveys: !isMonthlyResponsesLimitReached
          ? transformedSurveys.map((survey) => replaceAttributeRecallInLegacySurveys(survey, attributes))
          : [],
        person,
        noCodeActionClasses,
        language,
        product: updatedProduct,
      };
    }

    return responses.successResponse({ ...state }, true);
  } catch (error) {
    console.error(error);
    return responses.internalServerErrorResponse("Unable to handle the request: " + error.message, true);
  }
};
