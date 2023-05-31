import { useState, useEffect } from "react";
import { cn } from "@formbricks/lib/cn";
import type { MultipleChoiceMultiQuestion } from "@formbricks/types/questions";
import Headline from "./Headline";
import Subheader from "./Subheader";
import SubmitButton from "@/components/preview/SubmitButton";
import { Input } from "@/../../packages/ui";

interface MultipleChoiceMultiProps {
  question: MultipleChoiceMultiQuestion;
  onSubmit: (data: { [x: string]: any }) => void;
  lastQuestion: boolean;
  brandColor: string;
}

export default function MultipleChoiceMultiQuestion({
  question,
  onSubmit,
  lastQuestion,
  brandColor,
}: MultipleChoiceMultiProps) {
  const [selectedChoices, setSelectedChoices] = useState<string[]>([]);
  const [isAtLeastOneChecked, setIsAtLeastOneChecked] = useState(false);
  const [showOther, setShowOther] = useState(false);
  const [otherSpecified, setOtherSpecified] = useState("");

  useEffect(() => {
    setIsAtLeastOneChecked(selectedChoices.length > 0 || otherSpecified.length > 0);
  }, [selectedChoices, otherSpecified]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        selectedChoices.push(otherSpecified);

        if (question.required && selectedChoices.length <= 0) {
          return;
        }

        const data = {
          [question.id]: selectedChoices,
        };
        onSubmit(data);
        // console.log(data);
        setSelectedChoices([]); // reset value
        setShowOther(false);
        setOtherSpecified("");
      }}>
      <Headline headline={question.headline} questionId={question.id} />
      <Subheader subheader={question.subheader} questionId={question.id} />
      <div className="mt-4">
        <fieldset>
          <legend className="sr-only">Options</legend>
          <div className="relative space-y-2 rounded-md bg-white">
            {question.choices &&
              question.choices.map((choice) => (
                <>
                  <label
                    key={choice.id}
                    className={cn(
                      selectedChoices.includes(choice.label) || (choice.id === "other" && showOther)
                        ? "z-10 border-slate-400 bg-slate-50"
                        : "border-gray-200",
                      "relative flex cursor-pointer flex-col rounded-md border p-4 hover:bg-slate-50 focus:outline-none"
                    )}>
                    <span className="flex flex-col text-sm">
                      <span className="flex items-center">
                        <input
                          type="checkbox"
                          id={choice.id}
                          name={question.id}
                          value={choice.label}
                          className="h-4 w-4 border border-slate-300 focus:ring-0 focus:ring-offset-0"
                          aria-labelledby={`${choice.id}-label`}
                          checked={
                            selectedChoices.includes(choice.label) || (choice.id === "other" && showOther)
                          }
                          onChange={(e) => {
                            if (choice.id === "other") {
                              setShowOther(e.currentTarget.checked);

                              return;
                            }

                            if (e.currentTarget.checked) {
                              setSelectedChoices([...selectedChoices, e.currentTarget.value]);
                            } else {
                              setSelectedChoices(
                                selectedChoices.filter((label) => label !== e.currentTarget.value)
                              );
                            }
                          }}
                          style={{ borderColor: brandColor, color: brandColor }}
                        />
                        <span id={`${choice.id}-label`} className="ml-3 font-medium">
                          {choice.label}
                        </span>
                      </span>
                      {choice.id === "other" && showOther && (
                        <Input
                          type="text"
                          id={`${choice.id}-label`}
                          name={question.id}
                          className="mt-2"
                          placeholder="Please specify"
                          onChange={(e) => setOtherSpecified(e.currentTarget.value)}
                          aria-labelledby={`${choice.id}-label`}
                        />
                      )}
                    </span>
                  </label>
                </>
              ))}
          </div>
        </fieldset>
      </div>
      <input
        type="text"
        className="clip-[rect(0,0,0,0)] absolute m-[-1px] h-1 w-1 overflow-hidden whitespace-nowrap border-0 p-0 text-transparent caret-transparent focus:border-transparent focus:ring-0"
        required={question.required}
        value={isAtLeastOneChecked ? "checked" : ""}
        onChange={() => {}}
      />
      <div className="mt-4 flex w-full justify-between">
        <div></div>
        <SubmitButton {...{ question, lastQuestion, brandColor }} />
      </div>
    </form>
  );
}
