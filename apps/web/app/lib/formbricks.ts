import formbricks from "@formbricks/js";
import { env } from "@formbricks/lib/env.mjs";

export const formbricksEnabled =
  typeof env.NEXT_PUBLIC_FORMBRICKS_API_HOST && env.NEXT_PUBLIC_FORMBRICKS_ENVIRONMENT_ID;
const ttc = { onboarding: 0 };

export const createResponse = async (
  surveyId: string,
  data: { [questionId: string]: any },
  finished: boolean = false
): Promise<any> => {
  const api = formbricks.getApi();
  const personId = formbricks.getPerson()?.id;
  return await api.client.response.create({
    surveyId,
    personId: personId ?? "",
    finished,
    data,
    ttc,
  });
};

export const updateResponse = async (
  responseId: string,
  data: { [questionId: string]: any },
  finished: boolean = false
): Promise<any> => {
  const api = formbricks.getApi();
  return await api.client.response.update({
    responseId,
    finished,
    data,
    ttc,
  });
};

export const formbricksLogout = async () => {
  return await formbricks.logout();
};
