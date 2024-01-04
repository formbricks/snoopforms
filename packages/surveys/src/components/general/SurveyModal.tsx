import Modal from "@/components/wrappers/Modal";
import { SurveyModalProps } from "@/types/props";
import { useState } from "preact/hooks";

import { Survey } from "./Survey";

export function SurveyModal({
  survey,
  isBrandingEnabled,
  activeQuestionId,
  brandColor,
  isError,
  triggerErrorFunction,
  placement,
  clickOutside,
  darkOverlay,
  highlightBorderColor,
  onDisplay,
  onActiveQuestionChange,
  onResponse,
  onClose,
  onFinished = () => {},
  onFileUpload,
  isRedirectDisabled = false,
  responseCount,
}: SurveyModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  const close = () => {
    setIsOpen(false);
    setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, 1000); // wait for animation to finish}
  };

  return (
    <div id="fbjs" className="formbricks-form">
      <Modal
        placement={placement}
        clickOutside={clickOutside}
        darkOverlay={darkOverlay}
        highlightBorderColor={highlightBorderColor}
        isOpen={isOpen}
        onClose={close}>
        <Survey
          survey={survey}
          isBrandingEnabled={isBrandingEnabled}
          brandColor={brandColor}
          activeQuestionId={activeQuestionId}
          onDisplay={onDisplay}
          onActiveQuestionChange={onActiveQuestionChange}
          onResponse={onResponse}
          onClose={close}
          onFinished={() => {
            onFinished();
            setTimeout(() => {
              if (!survey.redirectUrl) {
                close();
              }
            }, 3000); // close modal automatically after 3 seconds
          }}
          triggerErrorFunction={triggerErrorFunction}
          isError={isError}
          onFileUpload={onFileUpload}
          isRedirectDisabled={isRedirectDisabled}
          responseCount={responseCount}
        />
      </Modal>
    </div>
  );
}
