"use client";

import { loadNewUserSegmentAction } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/actions";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import Modal from "@/components/shared/Modal";
import { useUserSegments } from "@/lib/userSegments/userSegments";
import { TUserSegment, ZUserSegmentFilterGroup } from "@formbricks/types/v1/userSegment";
import { Button } from "@formbricks/ui";
import React from "react";
import toast from "react-hot-toast";

type LoadSegmentModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  surveyId: string;
  environmentId: string;
  step: "initial" | "load";
  setStep: (step: "initial" | "load") => void;
  userSegment: TUserSegment;
  setUserSegment: (userSegment: TUserSegment) => void;
  setIsSegmentEditorOpen: (isOpen: boolean) => void;
};

const SegmentDetails = ({
  environmentId,
  surveyId,
  setOpen,
  setUserSegment,
  userSegment,
  setIsSegmentEditorOpen,
}: {
  environmentId: string;
  surveyId: string;
  userSegment: TUserSegment;
  setUserSegment: (userSegment: TUserSegment) => void;
  setOpen: (open: boolean) => void;
  setIsSegmentEditorOpen: (isOpen: boolean) => void;
}) => {
  const { userSegments, isLoadingUserSegments } = useUserSegments(environmentId);

  if (isLoadingUserSegments) {
    return <LoadingSpinner />;
  }

  const handleLoadNewSegment = async (segmentId: string) => {
    try {
      const updatedSurvey = await loadNewUserSegmentAction(surveyId, segmentId);

      if (!updatedSurvey?.id) {
        throw new Error("Error loading segment");
      }

      if (!updatedSurvey.userSegment) {
        throw new Error("Error loading segment");
      }

      const parsedFilters = ZUserSegmentFilterGroup.safeParse(updatedSurvey?.userSegment?.filters);

      if (!parsedFilters.success) {
        throw new Error("Invalid segment filters");
      }

      setUserSegment({
        ...updatedSurvey.userSegment,
        description: updatedSurvey.userSegment.description || "",
        filters: parsedFilters.data,
        surveys: updatedSurvey.userSegment.surveys.map((survey) => survey.id),
      });

      setIsSegmentEditorOpen(false);
      setOpen(false);
    } catch (err) {
      toast.error(err.message);
      setOpen(false);
    }
  };

  const userSegmentsArray = userSegments?.filter(
    (segment) => segment.id !== userSegment.id && !segment.isPrivate
  );

  return (
    <div className="flex flex-col">
      {!userSegmentsArray?.length && (
        <div className="text-center text-base font-medium">You have not created a segment yet</div>
      )}

      {userSegmentsArray?.map((segment) => (
        <div
          key={segment.id}
          className="flex cursor-pointer flex-col gap-2 rounded-lg p-2 hover:bg-slate-100"
          onClick={() => {
            handleLoadNewSegment(segment.id);
          }}>
          <div className="text-base font-medium">{segment.title}</div>
          <div className="text-sm text-slate-500">{segment.description}</div>
        </div>
      ))}
    </div>
  );
};

const LoadSegmentModal = ({
  environmentId,
  surveyId,
  open,
  setOpen,
  setStep,
  step,
  userSegment,
  setUserSegment,
  setIsSegmentEditorOpen,
}: LoadSegmentModalProps) => {
  const handleResetState = () => {
    setStep("initial");
    setOpen(false);
  };

  return (
    <Modal
      open={open}
      setOpen={() => {
        handleResetState();
      }}
      title="Load Segment">
      {step === "initial" && (
        <div>
          <p>Loading a Segment will overwrite all current filters. This can not be undone.</p>
          <div className="space-x-2 text-right">
            <Button
              variant="warn"
              onClick={() => {
                handleResetState();
              }}>
              Cancel
            </Button>
            <Button
              variant="darkCTA"
              onClick={() => {
                setStep("load");
              }}>
              Load Segment anyways
            </Button>
          </div>
        </div>
      )}

      {step === "load" && (
        <SegmentDetails
          environmentId={environmentId}
          surveyId={surveyId}
          setOpen={setOpen}
          setUserSegment={setUserSegment}
          userSegment={userSegment}
          setIsSegmentEditorOpen={setIsSegmentEditorOpen}
        />
      )}
    </Modal>
  );
};

export default LoadSegmentModal;
