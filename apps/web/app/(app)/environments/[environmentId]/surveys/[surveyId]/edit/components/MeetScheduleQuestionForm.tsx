import { TSurveyMeetScheduleQuestion } from "@formbricks/types/surveys";
import { Label } from "@formbricks/ui/Label";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/solid";

import { Button } from "@formbricks/ui/Button";
import { Input } from "@formbricks/ui/Input";
import { useState } from "react";

interface MeetScheduleQuestionFormProps {
  question: TSurveyMeetScheduleQuestion;
  questionIdx: number;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  lastQuestion: boolean;
  isInValid: boolean;
}

export default function MeetScheduleQuestionForm({
  question,
  questionIdx,
  updateQuestion,
  isInValid,
}: MeetScheduleQuestionFormProps): JSX.Element {
  const [showSubheader, setShowSubheader] = useState(!!question.subheader);

  return (
    <form>
      <div className="mt-3">
        <Label htmlFor="headline">Question</Label>
        <div className="mt-2">
          <Input
            autoFocus
            id="headline"
            name="headline"
            value={question.headline}
            onChange={(e) => updateQuestion(questionIdx, { headline: e.target.value })}
            isInvalid={isInValid && question.headline.trim() === ""}
          />
        </div>
      </div>
      <div className="mt-3">
        {showSubheader && (
          <>
            <Label htmlFor="subheader">Description</Label>
            <div className="mt-2 inline-flex w-full items-center">
              <Input
                id="subheader"
                name="subheader"
                value={question.subheader}
                onChange={(e) => updateQuestion(questionIdx, { subheader: e.target.value })}
              />
              <TrashIcon
                className="ml-2 h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-500"
                onClick={() => {
                  setShowSubheader(false);
                  updateQuestion(questionIdx, { subheader: "" });
                }}
              />
            </div>
          </>
        )}
        {!showSubheader && (
          <Button size="sm" variant="minimal" type="button" onClick={() => setShowSubheader(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Description
          </Button>
        )}
        <div className="mt-3">
          <Label htmlFor="meetingLink">
            cal.com username or username/meetType (naitikkapadia or naitikkapadia/15min)
          </Label>
          <div className="mt-2">
            <Input
              id="meetingLink"
              name="meetingLink"
              value={question.meetingLink}
              onChange={(e) => updateQuestion(questionIdx, { meetingLink: e.target.value })}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
