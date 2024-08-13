import { diffInDays } from "@formbricks/lib/utils/datetime";
import { TJsWebsitePersonState, TJsWebsiteState, TJsWebsiteSyncParams } from "@formbricks/types/js";
import { TSurvey } from "@formbricks/types/surveys/types";
import { NetworkError, Result, err, ok } from "../../shared/errors";
import { Logger } from "../../shared/logger";
import { getIsDebug } from "../../shared/utils";
import { WebsiteConfig } from "./config";

const websiteConfig = WebsiteConfig.getInstance();
const logger = Logger.getInstance();

let syncIntervalId: number | null = null;

const syncWithBackend = async (
  { apiHost, environmentId }: TJsWebsiteSyncParams,
  noCache: boolean
): Promise<Result<TJsWebsiteState, NetworkError>> => {
  try {
    const baseUrl = `${apiHost}/api/v1/client/${environmentId}/website/sync`;
    const urlSuffix = `?version=${import.meta.env.VERSION}`;

    let fetchOptions: RequestInit = {};

    if (noCache || getIsDebug()) {
      fetchOptions.cache = "no-cache";
      logger.debug("No cache option set for sync");
    }

    // if user id is not available
    const url = baseUrl + urlSuffix;
    // public survey
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const jsonRes = await response.json();

      return err({
        code: "network_error",
        status: response.status,
        message: "Error syncing with backend",
        url,
        responseMessage: jsonRes.message,
      });
    }

    return ok((await response.json()).data as TJsWebsiteState);
  } catch (e) {
    return err(e as NetworkError);
  }
};

export const sync = async (params: TJsWebsiteSyncParams, noCache = false): Promise<void> => {
  try {
    const syncResult = await syncWithBackend(params, noCache);

    if (syncResult?.ok !== true) {
      throw syncResult.error;
    }

    let oldState: TJsWebsiteState | undefined;
    try {
      oldState = websiteConfig.get().state;
    } catch (e) {
      // ignore error
    }

    let state: TJsWebsiteState = {
      surveys: syncResult.value.surveys as TSurvey[],
      actionClasses: syncResult.value.actionClasses,
      product: syncResult.value.product,
      displays: oldState?.displays || [],
    };

    state = filterPublicSurveys(state);

    const surveyNames = state.surveys.map((s) => s.name);
    logger.debug("Fetched " + surveyNames.length + " surveys during sync: " + surveyNames.join(", "));

    websiteConfig.update({
      apiHost: params.apiHost,
      environmentId: params.environmentId,
      state,
      expiresAt: new Date(new Date().getTime() + 2 * 60000), // 2 minutes in the future
    });
  } catch (error) {
    console.error(`Error during sync: ${error}`);
    throw error;
  }
};

export const filterPublicSurveys = (
  state: TJsWebsiteState,
  personState: TJsWebsitePersonState
): TJsWebsiteState => {
  const { product, surveys } = state;
  const { displays, responses, lastDisplayAt } = personState;

  if (!displays) {
    return state;
  }

  // Function to filter surveys based on displayOption criteria
  let filteredSurveys = surveys.filter((survey: TSurvey) => {
    switch (survey.displayOption) {
      case "respondMultiple":
        return true;
      case "displayOnce":
        return displays.filter((surveyId) => surveyId === survey.id).length === 0;
      case "displayMultiple":
        return responses.filter((surveyId) => surveyId === survey.id).length === 0;

      case "displaySome":
        if (survey.displayLimit === null) {
          return true;
        }

        // Check if survey response exists, if so, stop here
        if (responses.filter((surveyId) => surveyId === survey.id)) {
          return false;
        }

        // Otherwise, check if displays length is less than displayLimit
        return displays.filter((surveyId) => surveyId === survey.id).length < survey.displayLimit;

      default:
        throw Error("Invalid displayOption");
    }
  });

  // filter surveys that meet the recontactDays criteria
  filteredSurveys = filteredSurveys.filter((survey) => {
    // if no survey was displayed yet, show the survey
    if (!lastDisplayAt) {
      return true;
    }
    // if survey has recontactDays, check if the last display was more than recontactDays ago
    else if (survey.recontactDays !== null) {
      return diffInDays(new Date(), new Date(lastDisplayAt)) >= survey.recontactDays;
    }
    // use recontactDays of the product if survey does not have recontactDays
    else if (product.recontactDays !== null) {
      return diffInDays(new Date(), new Date(lastDisplayAt)) >= product.recontactDays;
    }
    // if no recontactDays is set, show the survey
    else {
      return true;
    }
  });

  return {
    ...state,
    surveys: filteredSurveys,
  };
};

export const addExpiryCheckListener = (): void => {
  const updateInterval = 1000 * 30; // every 30 seconds
  // add event listener to check sync with backend on regular interval
  if (typeof window !== "undefined" && syncIntervalId === null) {
    syncIntervalId = window.setInterval(async () => {
      try {
        // check if the config has not expired yet
        if (websiteConfig.get().expiresAt && new Date(websiteConfig.get().expiresAt) >= new Date()) {
          return;
        }
        logger.debug("Config has expired. Starting sync.");
        await sync({
          apiHost: websiteConfig.get().apiHost,
          environmentId: websiteConfig.get().environmentId,
        });
      } catch (e) {
        console.error(`Error during expiry check: ${e}`);
        logger.debug("Extending config and try again later.");
        const existingConfig = websiteConfig.get();
        websiteConfig.update(existingConfig);
      }
    }, updateInterval);
  }
};

export const removeExpiryCheckListener = (): void => {
  if (typeof window !== "undefined" && syncIntervalId !== null) {
    window.clearInterval(syncIntervalId);

    syncIntervalId = null;
  }
};
