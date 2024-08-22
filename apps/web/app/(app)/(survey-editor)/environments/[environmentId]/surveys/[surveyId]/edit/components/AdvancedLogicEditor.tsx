import { AdvancedLogicEditorActions } from "@/app/(app)/(survey-editor)/environments/[environmentId]/surveys/[surveyId]/edit/components/AdvancedLogicEditorActions";
import { AdvancedLogicEditorConditions } from "@/app/(app)/(survey-editor)/environments/[environmentId]/surveys/[surveyId]/edit/components/AdvancedLogicEditorConditions";
import { removeAction } from "@formbricks/lib/survey/logic/utils";
import { TAttributeClass } from "@formbricks/types/attribute-classes";
import { TSurveyAdvancedLogic } from "@formbricks/types/surveys/logic";
import { TSurvey, TSurveyQuestion } from "@formbricks/types/surveys/types";

interface AdvancedLogicEditorProps {
  localSurvey: TSurvey;
  logicItem: TSurveyAdvancedLogic;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  question: TSurveyQuestion;
  questionIdx: number;
  logicIdx: number;
  hiddenFields: string[];
  userAttributes: string[];
  attributeClasses: TAttributeClass[];
}

export function AdvancedLogicEditor({
  localSurvey,
  logicItem,
  updateQuestion,
  question,
  questionIdx,
  logicIdx,
  hiddenFields,
  userAttributes,
  attributeClasses,
}: AdvancedLogicEditorProps) {
  const handleActionsChange = (action: "delete" | "addBelow" | "duplicate", actionIdx: number) => {
    const actionsClone = structuredClone(logicItem.actions);
    let updatedActions: TSurveyAdvancedLogic["actions"] = actionsClone;

    if (action === "delete") {
      updatedActions = removeAction(actionsClone, actionIdx);
    } else if (action === "addBelow") {
      updatedActions.splice(actionIdx + 1, 0, { objective: "" });
    } else if (action === "duplicate") {
      updatedActions.splice(actionIdx + 1, 0, actionsClone[actionIdx]);
    }

    updateQuestion(questionIdx, {
      advancedLogic: question.advancedLogic?.map((logicItem, i) => {
        if (i === logicIdx) {
          return {
            ...logicItem,
            actions: updatedActions,
          };
        }

        return logicItem;
      }),
    });
  };
  return (
    <div className="flex w-full flex-col gap-4 overflow-auto rounded-lg border border-slate-200 bg-slate-100 p-4">
      <AdvancedLogicEditorConditions
        conditions={logicItem.conditions}
        updateQuestion={updateQuestion}
        question={question}
        questionIdx={questionIdx}
        logicIdx={logicIdx}
        hiddenFields={hiddenFields}
        userAttributes={userAttributes}
      />
      <AdvancedLogicEditorActions
        logicItem={logicItem}
        handleActionsChange={handleActionsChange}
        hiddenFields={hiddenFields}
        localSurvey={localSurvey}
        userAttributes={userAttributes}
        questionIdx={questionIdx}
        attributeClasses={attributeClasses}
      />
    </div>
  );
}
