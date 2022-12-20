import useSWR from "swr";
import { fetcher } from "@/lib/utils";

export const useSubmissions = (teamId: string, formId: string) => {
  const { data, error, mutate } = useSWR(`/api/teams/${teamId}/forms/${formId}/submissions`, fetcher);

  return {
    submissions: data,
    isLoadingSubmissions: !error && !data,
    isErrorSubmissions: error,
    mutateSubmissions: mutate,
  };
};

export const deleteSubmission = async (teamId: string, formId: string, submissionId: string) => {
  try {
    await fetch(`/api/teams/${teamId}/forms/${formId}/submissions/${submissionId}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(error);
    throw Error(`deleteSubmission: unable to delete submission: ${error.message}`);
  }
};

export const persistSubmission = async (submission) => {
  try {
    await fetch(`/api/teams/${submission.teamId}/forms/${submission.formId}/submissions/${submission.id}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(submission),
    });
  } catch (error) {
    console.error(error);
  }
};
