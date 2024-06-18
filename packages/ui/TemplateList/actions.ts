"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@formbricks/lib/authOptions";
import { hasUserEnvironmentAccess } from "@formbricks/lib/environment/auth";
import { createSurvey } from "@formbricks/lib/survey/service";
import { AuthorizationError } from "@formbricks/types/errors";
import { TSurveyInput } from "@formbricks/types/surveys/types";

export const createSurveyAction = async (environmentId: string, surveyBody: TSurveyInput) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await hasUserEnvironmentAccess(session.user.id, environmentId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  return await createSurvey(environmentId, surveyBody);
};
