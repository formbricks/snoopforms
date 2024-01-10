"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@formbricks/lib/authOptions";
import {
  cloneUserSegment,
  createUserSegment,
  deleteUserSegment,
  getUserSegment,
  loadNewUserSegment,
  updateUserSegment,
} from "@formbricks/lib/services/userSegment";
import { canUserAccessSurvey, verifyUserRoleAccess } from "@formbricks/lib/survey/auth";
import { deleteSurvey, getSurvey, updateSurvey } from "@formbricks/lib/survey/service";
import { formatSurveyDateFields } from "@formbricks/lib/survey/util";
import { AuthorizationError } from "@formbricks/types/errors";
import { TSurvey } from "@formbricks/types/surveys";
import {
  TBaseFilterGroup,
  TUserSegmentUpdateInput,
  ZUserSegmentFilterGroup,
} from "@formbricks/types/userSegment";

export const createUserSegmentAction = async ({
  description,
  environmentId,
  filters,
  isPrivate,
  surveyId,
  title,
}: {
  environmentId: string;
  surveyId: string;
  title: string;
  description: string;
  isPrivate: boolean;
  filters: TBaseFilterGroup;
}) => {
  const parsedFilters = ZUserSegmentFilterGroup.safeParse(filters);

  if (!parsedFilters.success) {
    const errMsg =
      parsedFilters.error.issues.find((issue) => issue.code === "custom")?.message || "Invalid filters";
    throw new Error(errMsg);
  }

  return await createUserSegment(environmentId, surveyId, title, description, isPrivate, filters);
};

export const updateUserSegmentAction = async (segmentId: string, data: TUserSegmentUpdateInput) => {
  const { filters } = data;
  const parsedFilters = ZUserSegmentFilterGroup.safeParse(filters);

  if (!parsedFilters.success) {
    throw new Error("Invalid filters");
  }

  return await updateUserSegment(segmentId, data);
};

export const loadNewUserSegmentAction = async (surveyId: string, segmentId: string) => {
  return await loadNewUserSegment(surveyId, segmentId);
};

export const cloneUserSegmentAction = async (segmentId: string, surveyId: string) => {
  try {
    const clonedUserSegment = await cloneUserSegment(segmentId, surveyId);
    return clonedUserSegment;
  } catch (err) {
    throw new Error(err);
  }
};

export const deleteUserSegmentAction = async (segmentId: string) => {
  const foundSegment = await getUserSegment(segmentId);

  if (!foundSegment) {
    throw new Error(`Segment with id ${segmentId} not found`);
  }

  return await deleteUserSegment(segmentId);
};

export async function surveyMutateAction(survey: TSurvey): Promise<TSurvey> {
  return await updateSurvey(survey);
}

export async function updateSurveyAction(survey: TSurvey): Promise<TSurvey> {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, survey.id);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const { hasCreateOrUpdateAccess } = await verifyUserRoleAccess(survey.environmentId, session.user.id);
  if (!hasCreateOrUpdateAccess) throw new AuthorizationError("Not authorized");

  const _survey = {
    ...survey,
    ...formatSurveyDateFields(survey),
  };

  return await updateSurvey(_survey);
}

export const deleteSurveyAction = async (surveyId: string) => {
  const session = await getServerSession(authOptions);
  if (!session) throw new AuthorizationError("Not authorized");

  const isAuthorized = await canUserAccessSurvey(session.user.id, surveyId);
  if (!isAuthorized) throw new AuthorizationError("Not authorized");

  const survey = await getSurvey(surveyId);
  const { hasDeleteAccess } = await verifyUserRoleAccess(survey!.environmentId, session.user.id);
  if (!hasDeleteAccess) throw new AuthorizationError("Not authorized");

  await deleteSurvey(surveyId);
};
