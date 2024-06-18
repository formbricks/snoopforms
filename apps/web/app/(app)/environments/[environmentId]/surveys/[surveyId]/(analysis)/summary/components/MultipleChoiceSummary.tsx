import Link from "next/link";
import { useState } from "react";
import { getPersonIdentifier } from "@formbricks/lib/person/utils";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { TSurvey, TSurveyQuestionSummaryMultipleChoice, TSurveyType } from "@formbricks/types/surveys/types";
import { PersonAvatar } from "@formbricks/ui/Avatars";
import { Button } from "@formbricks/ui/Button";
import { ProgressBar } from "@formbricks/ui/ProgressBar";
import { convertFloatToNDecimal } from "../lib/utils";
import { QuestionSummaryHeader } from "./QuestionSummaryHeader";

interface MultipleChoiceSummaryProps {
  questionSummary: TSurveyQuestionSummaryMultipleChoice;
  environmentId: string;
  surveyType: TSurveyType;
  survey: TSurvey;
  attributeClasses: TAttributeClass[];
}

export const MultipleChoiceSummary = ({
  questionSummary,
  environmentId,
  surveyType,
  survey,
  attributeClasses,
}: MultipleChoiceSummaryProps) => {
  const [visibleOtherResponses, setVisibleOtherResponses] = useState(10);

  // sort by count and transform to array
  const results = Object.values(questionSummary.choices).sort((a, b) => {
    if (a.others) return 1; // Always put a after b if a has 'others'
    if (b.others) return -1; // Always put b after a if b has 'others'

    return b.count - a.count; // Sort by count
  });

  const handleLoadMore = () => {
    const lastChoice = results[results.length - 1];
    const hasOthers = lastChoice.others && lastChoice.others.length > 0;

    if (!hasOthers) return; // If there are no 'others' to show, don't increase the visible options

    // Increase the number of visible responses by 10, not exceeding the total number of responses
    setVisibleOtherResponses((prevVisibleOptions) =>
      Math.min(prevVisibleOptions + 10, lastChoice.others?.length || 0)
    );
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <QuestionSummaryHeader
        questionSummary={questionSummary}
        survey={survey}
        attributeClasses={attributeClasses}
      />
      <div className="space-y-5 px-4 pb-6 pt-4 text-sm md:px-6 md:text-base">
        {results.map((result, resultsIdx) => (
          <div key={result.value}>
            <div className="text flex flex-col justify-between px-2 pb-2 sm:flex-row">
              <div className="mr-8 flex w-full justify-between space-x-1 sm:justify-normal">
                <p className="font-semibold text-slate-700">
                  {results.length - resultsIdx} - {result.value}
                </p>
                <div>
                  <p className="rounded-lg bg-slate-100 px-2 text-slate-700">
                    {convertFloatToNDecimal(result.percentage, 1)}%
                  </p>
                </div>
              </div>
              <p className="flex w-full pt-1 text-slate-600 sm:items-end sm:justify-end sm:pt-0">
                {result.count} {result.count === 1 ? "response" : "responses"}
              </p>
            </div>
            <ProgressBar barColor="bg-brand-dark" progress={result.percentage / 100} />
            {result.others && result.others.length > 0 && (
              <div className="mt-4 rounded-lg border border-slate-200">
                <div className="grid h-12 grid-cols-2 content-center rounded-t-lg bg-slate-100 text-left text-sm font-semibold text-slate-900">
                  <div className="col-span-1 pl-6 ">Other values found</div>
                  <div className="col-span-1 pl-6 ">{surveyType === "app" && "User"}</div>
                </div>
                {result.others
                  .filter((otherValue) => otherValue.value !== "")
                  .slice(0, visibleOtherResponses)
                  .map((otherValue, idx) => (
                    <div key={idx}>
                      {surveyType === "link" && (
                        <div
                          key={idx}
                          className="ph-no-capture col-span-1 m-2 flex h-10 items-center rounded-lg pl-4 text-sm font-medium text-slate-900">
                          <span>{otherValue.value}</span>
                        </div>
                      )}
                      {surveyType === "app" && otherValue.person && (
                        <Link
                          href={
                            otherValue.person.id
                              ? `/environments/${environmentId}/people/${otherValue.person.id}`
                              : { pathname: null }
                          }
                          key={idx}
                          className="m-2 grid h-16 grid-cols-2 items-center rounded-lg text-sm hover:bg-slate-100">
                          <div className="ph-no-capture col-span-1 pl-4 font-medium text-slate-900">
                            <span>{otherValue.value}</span>
                          </div>
                          <div className="ph-no-capture col-span-1 flex items-center space-x-4 pl-6 font-medium text-slate-900">
                            {otherValue.person.id && <PersonAvatar personId={otherValue.person.id} />}
                            <span>{getPersonIdentifier(otherValue.person, otherValue.personAttributes)}</span>
                          </div>
                        </Link>
                      )}
                    </div>
                  ))}
                {visibleOtherResponses < result.others.length && (
                  <div className="flex justify-center py-4">
                    <Button onClick={handleLoadMore} variant="secondary" size="sm">
                      Load more
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
