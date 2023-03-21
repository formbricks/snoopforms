import { cn } from "@/lib/utils";
import type { MultipleChoiceSingleQuestion } from "@/types/questions";
import { useState } from "react";
import Headline from "./Headline";
import Subheader from "./Subheader";

interface MultipleChoiceSingleProps {
  question: MultipleChoiceSingleQuestion;
  onSubmit: (data: { [x: string]: any }) => void;
  lastQuestion: boolean;
}

export default function MultipleChoiceSingleQuestion({
  question,
  onSubmit,
  lastQuestion,
}: MultipleChoiceSingleProps) {
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = {
          [question.id]: e.currentTarget[question.id].value,
        };
        console.log(data);
        e.currentTarget[question.id].value = "";
        onSubmit(data);
        // reset form
      }}>
      <Headline headline={question.headline} questionId={question.id} />
      <Subheader subheader={question.subheader} questionId={question.id} />
      <div className="mt-4">
        <fieldset>
          <legend className="sr-only">Choices</legend>
          <div className="relative space-y-2 rounded-md bg-white">
            {question.choices &&
              question.choices.map((choice) => (
                <label
                  key={choice.id}
                  className={cn(
                    selectedChoice === choice.label ? "z-10 border-slate-400 bg-slate-50" : "border-gray-200",
                    "relative flex cursor-pointer flex-col rounded-md border p-4 hover:bg-slate-50 focus:outline-none"
                  )}>
                  <span className="flex items-center text-sm">
                    <input
                      type="radio"
                      id={choice.id}
                      name={question.id}
                      value={choice.label}
                      className="h-4 w-4 border-gray-300 text-slate-600 focus:ring-slate-600"
                      aria-labelledby={`${choice.id}-label`}
                      onChange={(e) => {
                        setSelectedChoice(e.currentTarget.value);
                      }}
                    />
                    <span id={`${choice.id}-label`} className="ml-3 font-medium">
                      {choice.label}
                    </span>
                  </span>
                </label>
              ))}
          </div>
        </fieldset>
      </div>
      <div className="mt-4 flex w-full justify-between">
        <div></div>
        <button
          type="submit"
          className="flex items-center rounded-md border border-transparent bg-slate-600 px-3 py-3 text-base font-medium leading-4 text-white shadow-sm hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2">
          {question.buttonLabel || (lastQuestion ? "Finish" : "Next")}
        </button>
      </div>
    </form>
  );
}
