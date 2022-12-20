import { persistSubmission, useSubmissions } from "@/lib/submissions";
import { convertDateTimeString } from "@/lib/utils";
import { BugIcon, Button, ComplimentIcon, IdeaIcon } from "@formbricks/ui";
import { sub } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function FeedbackTimeline({ submissions, setSubmissions }) {
  const router = useRouter();

  const { submissions: allSubmissions, mutateSubmissions } = useSubmissions(
    router.query.teamId?.toString(),
    router.query.formId?.toString()
  );

  const toggleArchiveSubmission = (submission) => {
    const updatedSubmission = JSON.parse(JSON.stringify(submission));
    updatedSubmission.archived = !updatedSubmission.archived;
    // save submission without customer
    const submissionWoCustomer = { ...updatedSubmission };
    delete submissionWoCustomer.customer;
    persistSubmission(submissionWoCustomer);
    // update all submissions
    const submissionIdx = allSubmissions.findIndex((s) => s.id === submission.id);
    const updatedSubmissions = JSON.parse(JSON.stringify(allSubmissions));
    updatedSubmissions[submissionIdx] = updatedSubmission;
    mutateSubmissions(updatedSubmissions, false);
    if (updatedSubmission.archived) {
      toast.success("Submission archived");
    } else {
      toast.success("Submission restored");
    }
  };
  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {submissions.map((submission, submissionIdx) => (
          <li key={submission.id}>
            <div className="relative pb-8">
              {submissionIdx !== submissions.length - 1 ? (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={classNames(
                      "bg-white",
                      "flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-gray-50"
                    )}>
                    {submission.data.feedbackType === "compliment" ? (
                      <ComplimentIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : submission.data.feedbackType === "bug" ? (
                      <BugIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    ) : (
                      <IdeaIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    )}
                  </span>
                </div>
                <div className="w-full overflow-hidden rounded-lg bg-white shadow">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex w-full justify-between">
                      {submission.data.feedbackType === "compliment" ? (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Compliment
                        </span>
                      ) : submission.data.feedbackType === "bug" ? (
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Bug
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                          Idea
                        </span>
                      )}

                      <div className="text-sm text-gray-400">
                        <time dateTime={convertDateTimeString(submission.createdAt)}>
                          {convertDateTimeString(submission.createdAt)}
                        </time>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm text-gray-500">{submission.data.message} </p>
                    </div>
                  </div>
                  <div className=" bg-gray-50 p-4 sm:p-6">
                    <div className="flex w-full justify-between gap-4">
                      <div>
                        <p className="text-sm font-thin text-gray-500">User</p>
                        {submission.customer ? (
                          <Link
                            className="text-sm font-medium text-gray-700"
                            href={`/teams/${router.query.teamId}/customers/${submission.customer.id}`}>
                            {submission.customer.id}
                          </Link>
                        ) : (
                          <p className="text-sm text-gray-500">Anonymous</p>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-thin text-gray-500">Device</p>
                        <p className="text-sm text-gray-500">{submission.meta.userAgent}</p>
                      </div>
                      <div>
                        <p className="text-sm font-thin text-gray-500">Page</p>
                        <p className="text-sm text-gray-500">{submission.data.pageUrl}</p>
                      </div>
                    </div>

                    <div className="mt-8 flex w-full justify-end">
                      {!submission.archived ? (
                        <button
                          className="text-base text-gray-500 underline"
                          onClick={() => toggleArchiveSubmission(submission)}>
                          Archive
                        </button>
                      ) : (
                        <button
                          className="text-base text-gray-500 underline"
                          onClick={() => toggleArchiveSubmission(submission)}>
                          Restore
                        </button>
                      )}
                      {submission.customer && "email" in submission.customer.data && (
                        <Button
                          variant="primary"
                          href={`mailto:${submission.customer.email}`}
                          className="ml-4">
                          Send Email
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
