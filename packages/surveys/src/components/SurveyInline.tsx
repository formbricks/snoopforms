import { TResponse } from "@formbricks/types/v1/responses";
import { TPrefilledAnswerObj, TSurvey } from "@formbricks/types/v1/surveys";
import { Survey } from "./Survey";

interface SurveyModalProps {
  survey: TSurvey;
  brandColor: string;
  formbricksSignature: boolean;
  activeQuestionId?: string;
  onDisplay?: () => void;
  onActiveQuestionChange?: (questionId: string) => void;
  onResponse?: (response: Partial<TResponse>) => void;
  onClose?: () => void;
  prefilledObject?: TPrefilledAnswerObj;
}

export function SurveyModal({
  survey,
  brandColor,
  formbricksSignature,
  activeQuestionId,
  onDisplay = () => {},
  onActiveQuestionChange = () => {},
  onResponse = () => {},
  onClose = () => {},
  prefilledObject,
}: SurveyModalProps) {
  return (
    <div id="fbjs">
      <Survey
        survey={survey}
        brandColor={brandColor}
        formbricksSignature={formbricksSignature}
        activeQuestionId={activeQuestionId}
        onDisplay={onDisplay}
        onActiveQuestionChange={onActiveQuestionChange}
        onResponse={onResponse}
        onClose={onClose}
        prefilledObject={prefilledObject}
      />
    </div>
  );
}
