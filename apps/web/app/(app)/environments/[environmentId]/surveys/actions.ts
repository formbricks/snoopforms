"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { hasUserEnvironmentAccessCached } from "@formbricks/lib/environment/auth";
import { createSurvey } from "@formbricks/lib/survey/service";

export async function createSurveyAction(environmentId: string, surveyBody: any) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("You are not authorized to perform this action.");

  const isAuthorized = await hasUserEnvironmentAccessCached(session.user.id, environmentId);

  if (isAuthorized) {
    return await createSurvey(environmentId, surveyBody);
  } else {
    throw new Error("You are not authorized to perform this action.");
  }
}
