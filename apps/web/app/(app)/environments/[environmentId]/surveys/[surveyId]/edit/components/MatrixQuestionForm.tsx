"use client";

import { MatrixLabelInput } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/components/MatrixInput";
import { PlusIcon, TrashIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

import { TSurvey, TSurveyMatrixQuestion } from "@formbricks/types/surveys";
import { Button } from "@formbricks/ui/Button";
import { Label } from "@formbricks/ui/Label";
import QuestionFormInput from "@formbricks/ui/QuestionFormInput";

interface MatrixQuestionFormProps {
  localSurvey: TSurvey;
  question: TSurveyMatrixQuestion;
  questionIdx: number;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  lastQuestion: boolean;
  isInvalid: boolean;
}

export default function MatrixQuestionForm({
  question,
  questionIdx,
  updateQuestion,
  isInvalid,
  localSurvey,
}: MatrixQuestionFormProps): JSX.Element {
  const [showSubheader, setShowSubheader] = useState(!!question.subheader);

  // Function to delete a label input field
  const handleDeleteLabel = (type: "row" | "column", index: number) => {
    const labels = type === "row" ? question.rows : question.columns;
    if (labels.length <= 2) return; // Prevent deleting below minimum length
    const updatedLabels = labels.filter((_, idx) => idx !== index);
    if (type === "row") {
      updateQuestion(questionIdx, { ...question, ...{ rows: updatedLabels } });
    } else {
      updateQuestion(questionIdx, { ...question, ...{ columns: updatedLabels } });
    }
  };

  const handleOnChange = (index: number, type: "row" | "column", e) => {
    const newLabel = e.target.value;
    const labels = type === "row" ? [...question.rows] : [...question.columns];

    // Check for duplicate labels
    const isDuplicate = labels.includes(newLabel);
    if (isDuplicate) {
      toast.error(`Duplicate ${type} labels`);
    }

    // Update the label at the given index, or add a new label if index is undefined
    if (index !== undefined) {
      labels[index] = newLabel;
    } else {
      labels.push(newLabel);
    }
    updateQuestion(questionIdx, { ...question, [type]: labels });
  };

  // Function to add a new Label input field
  const handleAddLabel = (type: "row" | "column") => {
    if (type === "row") {
      const updatedRows = [...question.rows, ""];
      updateQuestion(questionIdx, { rows: updatedRows });
    } else {
      const updatedColumns = [...question.columns, ""];
      updateQuestion(questionIdx, { columns: updatedColumns });
    }
  };

  const environmentId = localSurvey.environmentId;

  return (
    <form>
      <QuestionFormInput
        localSurvey={localSurvey}
        environmentId={environmentId}
        isInvalid={isInvalid}
        questionId={question.id}
        questionIdx={questionIdx}
        updateQuestion={updateQuestion}
        type="headline"
      />
      <div>
        {showSubheader && (
          <div className="flex w-full items-center">
            <QuestionFormInput
              localSurvey={localSurvey}
              environmentId={environmentId}
              isInvalid={isInvalid}
              questionId={question.id}
              questionIdx={questionIdx}
              updateQuestion={updateQuestion}
              type="subheader"
            />
            <TrashIcon
              className="ml-2 mt-10 h-4 w-4 cursor-pointer text-slate-400 hover:text-slate-500"
              onClick={() => {
                setShowSubheader(false);
                updateQuestion(questionIdx, { subheader: "" });
              }}
            />
          </div>
        )}
        {!showSubheader && (
          <Button
            size="sm"
            variant="minimal"
            className="mt-3"
            type="button"
            onClick={() => setShowSubheader(true)}>
            <PlusIcon className="mr-1 h-4 w-4" />
            Add Description
          </Button>
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          {/* Rows section */}
          <Label htmlFor="rows">Rows</Label>
          <div className="mt-3 space-y-2">
            {question.rows.map((_, index) => (
              <MatrixLabelInput
                question={question}
                key={index}
                index={index}
                type="row"
                onDelete={() => handleDeleteLabel("row", index)}
                value={question.rows[index]}
                handleOnChange={handleOnChange}
              />
            ))}
            <Button
              variant="minimal"
              className="space-x-2"
              onClick={(e) => {
                e.preventDefault();
                handleAddLabel("row");
              }}>
              <PlusIcon className="h-4 w-4" />
              <span>Add Row</span>
            </Button>
          </div>
        </div>
        <div>
          {/* Columns section */}
          <Label htmlFor="columns">Columns</Label>
          <div className="mt-3 space-y-2">
            {question.columns.map((_, index) => (
              <MatrixLabelInput
                question={question}
                key={index}
                index={index}
                type="column"
                onDelete={() => handleDeleteLabel("column", index)}
                value={question.columns[index]}
                handleOnChange={handleOnChange}
              />
            ))}
            <Button
              variant="minimal"
              className="space-x-2"
              onClick={(e) => {
                e.preventDefault();
                handleAddLabel("column");
              }}>
              <PlusIcon className="h-4 w-4" />
              <span>Add Column</span>
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
