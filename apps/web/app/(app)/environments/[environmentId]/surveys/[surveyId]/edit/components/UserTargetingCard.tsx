"use client";

import { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon, PencilIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { isAdvancedSegment } from "@formbricks/lib/segment/utils";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { TBaseFilter, TSegment, TSegmentUpdateInput } from "@formbricks/types/segment";
import { TSurvey } from "@formbricks/types/surveys";
import AlertDialog from "@formbricks/ui/AlertDialog";
import { Button } from "@formbricks/ui/Button";
import BasicAddFilterModal from "@formbricks/ui/Targeting/BasicAddFilterModal";
import BasicSegmentEditor from "@formbricks/ui/Targeting/BasicSegmentEditor";
import LoadSegmentModal from "@formbricks/ui/Targeting/LoadSegmentModal";
import SaveAsNewSegmentModal from "@formbricks/ui/Targeting/SaveAsNewSegmentModal";
import SegmentTitle from "@formbricks/ui/Targeting/SegmentTitle";
import TargetingIndicator from "@formbricks/ui/Targeting/TargetingIndicator";
import { UpgradePlanNotice } from "@formbricks/ui/UpgradePlanNotice";

import {
  cloneBasicSegmentAction,
  createBasicSegmentAction,
  loadNewBasicSegmentAction,
  updateBasicSegmentAction,
} from "../actions";

interface UserTargetingCardProps {
  localSurvey: TSurvey;
  setLocalSurvey: React.Dispatch<React.SetStateAction<TSurvey>>;
  environmentId: string;
  attributeClasses: TAttributeClass[];
  segments: TSegment[];
  initialSegment?: TSegment;
}

export default function UserTargetingCard({
  localSurvey,
  setLocalSurvey,
  environmentId,
  attributeClasses,
  segments,
  initialSegment,
}: UserTargetingCardProps) {
  const [segment, setSegment] = useState<TSegment | null>(localSurvey.segment);
  const [open, setOpen] = useState(false);
  const [addFilterModalOpen, setAddFilterModalOpen] = useState(false);
  const [saveAsNewSegmentModalOpen, setSaveAsNewSegmentModalOpen] = useState(false);
  const [isSegmentEditorOpen, setIsSegmentEditorOpen] = useState(!!localSurvey.segment?.isPrivate);
  const [loadSegmentModalOpen, setLoadSegmentModalOpen] = useState(false);
  const [loadSegmentModalStep, setLoadSegmentModalStep] = useState<"initial" | "load">("initial");
  const [resetAllFiltersModalOpen, setResetAllFiltersModalOpen] = useState(false);
  const [segmentEditorViewOnly, setSegmentEditorViewOnly] = useState(true);

  const handleAddFilterInGroup = (filter: TBaseFilter) => {
    const updatedSegment = structuredClone(segment);

    if (updatedSegment?.filters?.length === 0) {
      updatedSegment.filters.push({
        ...filter,
        connector: null,
      });
    } else {
      updatedSegment?.filters.push(filter);
    }

    setSegment(updatedSegment);
  };

  const handleCloneSegment = async () => {
    if (!segment) return;

    try {
      const clonedSegment = await cloneBasicSegmentAction(segment.id, localSurvey.id);
      setSegment(clonedSegment);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLoadNewSegment = async (surveyId: string, segmentId: string) => {
    const updatedSurvey = await loadNewBasicSegmentAction(surveyId, segmentId);
    return updatedSurvey;
  };

  const handleSaveAsNewSegment = async (
    environmentId: string,
    segmentId: string,
    data: TSegmentUpdateInput
  ) => {
    const updatedSegment = await updateBasicSegmentAction(environmentId, segmentId, data);
    return updatedSegment;
  };

  useEffect(() => {
    if (!!segment && segment?.filters?.length > 0) {
      setOpen(true);
    }
  }, [segment, segment?.filters?.length]);

  useEffect(() => {
    setLocalSurvey((localSurveyOld) => ({
      ...localSurveyOld,
      segment: segment,
    }));
  }, [setLocalSurvey, segment]);

  const isSegmentUsedInOtherSurveys = useMemo(
    () => (localSurvey?.segment ? localSurvey.segment?.surveys?.length > 1 : false),
    [localSurvey.segment]
  );

  return (
    <Collapsible.Root
      open={open}
      onOpenChange={setOpen}
      className="w-full rounded-lg border border-slate-300 bg-white">
      <Collapsible.CollapsibleTrigger
        asChild
        className="h-full w-full cursor-pointer rounded-lg hover:bg-slate-50">
        <div className="inline-flex px-4 py-6">
          <div className="flex items-center pl-2 pr-5">
            <CheckCircleIcon className="h-8 w-8 text-green-400 " />
          </div>
          <div>
            <p className="font-semibold text-slate-800">Target Audience</p>
            <p className="mt-1 text-sm text-slate-500">Pre-segment your users with attributes filters.</p>
          </div>
        </div>
      </Collapsible.CollapsibleTrigger>
      <Collapsible.CollapsibleContent className="min-w-full overflow-auto">
        <hr className="text-slate-600" />

        <div className="flex flex-col gap-5 p-6">
          <TargetingIndicator segment={segment} />

          <div className="filter-scrollbar flex flex-col gap-4 overflow-auto rounded-lg border border-slate-300 bg-slate-50 p-4">
            <div className="flex w-full flex-col gap-2">
              {isAdvancedSegment(segment?.filters ?? []) ? (
                <div>
                  {!segment?.isPrivate ? (
                    <SegmentTitle
                      title={localSurvey.segment?.title}
                      description={localSurvey.segment?.description}
                    />
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Send survey to audience who match...
                      </p>
                    </div>
                  )}

                  <p className="text-sm italic text-slate-600">
                    This is an advanced segment. Please upgrade your plan to edit it.
                  </p>
                </div>
              ) : (
                <>
                  {isSegmentEditorOpen ? (
                    <div className="flex w-full flex-col gap-2">
                      <div>
                        {!segment?.isPrivate ? (
                          <SegmentTitle
                            title={localSurvey.segment?.title}
                            description={localSurvey.segment?.description}
                          />
                        ) : (
                          <div className="mb-4">
                            <p className="text-sm font-semibold text-slate-800">
                              Send survey to audience who match...
                            </p>
                          </div>
                        )}
                      </div>

                      {!!segment?.filters?.length && (
                        <div className="w-full">
                          <BasicSegmentEditor
                            key={segment.filters.toString()}
                            group={segment.filters}
                            environmentId={environmentId}
                            segment={segment}
                            setSegment={setSegment}
                            attributeClasses={attributeClasses}
                          />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Button variant="secondary" size="sm" onClick={() => setAddFilterModalOpen(true)}>
                          Add filter
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setSegmentEditorViewOnly(false)}>
                          Save changes
                        </Button>

                        {/*                         {isSegmentEditorOpen && !!segment?.filters?.length && (
                          <Button
                            variant="minimal"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => setResetAllFiltersModalOpen(true)}>
                            <p className="text-sm">Reset all filters</p>
                          </Button>
                        )} */}

                        {isSegmentEditorOpen && !segment?.isPrivate && !!segment?.filters?.length && (
                          <Button
                            variant="minimal"
                            size="sm"
                            className="flex items-center gap-2"
                            onClick={() => {
                              setIsSegmentEditorOpen(false);
                              setSegmentEditorViewOnly(false);

                              if (initialSegment) {
                                setSegment(initialSegment);
                              }
                            }}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 rounded-lg">
                      <SegmentTitle
                        title={localSurvey.segment?.title}
                        description={localSurvey.segment?.description}
                      />

                      {segmentEditorViewOnly && segment && (
                        <div className="opacity-60">
                          <BasicSegmentEditor
                            key={segment.filters.toString()}
                            group={segment.filters}
                            environmentId={environmentId}
                            segment={segment}
                            attributeClasses={attributeClasses}
                            setSegment={setSegment}
                            viewOnly
                          />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSegmentEditorViewOnly(!segmentEditorViewOnly);
                          }}>
                          {segmentEditorViewOnly ? "Hide" : "View"} Filters{" "}
                          {segmentEditorViewOnly ? (
                            <ChevronDownIcon className="ml-2 h-3 w-3" />
                          ) : (
                            <ChevronUpIcon className="ml-2 h-3 w-3" />
                          )}
                        </Button>

                        {isSegmentUsedInOtherSurveys && (
                          <Button variant="secondary" size="sm" onClick={() => handleCloneSegment()}>
                            Clone & Edit Segment
                          </Button>
                        )}
                        {!isSegmentUsedInOtherSurveys && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setIsSegmentEditorOpen(true);
                              setSegmentEditorViewOnly(false);
                            }}>
                            Edit Segment
                            <PencilIcon className="ml-2 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {isSegmentUsedInOtherSurveys && (
                        <p className="mt-1 flex items-center text-xs text-slate-500">
                          <AlertCircle className="mr-1 inline h-3 w-3" />
                          This segment is used in other surveys. Make changes{" "}
                          <Link
                            href={`/environments/${environmentId}/segments`}
                            target="_blank"
                            className="ml-1 underline">
                            here.
                          </Link>
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex w-full gap-3">
            <Button variant="secondary" size="sm" onClick={() => setLoadSegmentModalOpen(true)}>
              Load Segment
            </Button>

            {isSegmentEditorOpen && !!segment?.filters?.length && (
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
                onClick={() => setSaveAsNewSegmentModalOpen(true)}>
                Save as new Segment
              </Button>
            )}
          </div>
          <div className="-mt-1.5">
            <UpgradePlanNotice
              message="For advanced user targeting,"
              url={`/environments/${environmentId}/settings/billing`}
              textForUrl="please use Pro (free to get started)."
            />
          </div>
        </div>

        {!!segment && (
          <LoadSegmentModal
            open={loadSegmentModalOpen}
            setOpen={setLoadSegmentModalOpen}
            surveyId={localSurvey.id}
            step={loadSegmentModalStep}
            setStep={setLoadSegmentModalStep}
            currentSegment={segment}
            segments={segments.filter((segment) => !isAdvancedSegment(segment.filters))}
            setSegment={setSegment}
            setIsSegmentEditorOpen={setIsSegmentEditorOpen}
            onSegmentLoad={handleLoadNewSegment}
          />
        )}

        <BasicAddFilterModal
          onAddFilter={(filter) => {
            handleAddFilterInGroup(filter);
          }}
          open={addFilterModalOpen}
          setOpen={setAddFilterModalOpen}
          attributeClasses={attributeClasses}
        />

        {!!segment && (
          <SaveAsNewSegmentModal
            open={saveAsNewSegmentModalOpen}
            setOpen={setSaveAsNewSegmentModalOpen}
            localSurvey={localSurvey}
            segment={segment}
            setSegment={setSegment}
            setIsSegmentEditorOpen={setIsSegmentEditorOpen}
            onCreateSegment={async (data) => createBasicSegmentAction(data)}
            onUpdateSegment={handleSaveAsNewSegment}
          />
        )}

        <AlertDialog
          headerText="Are you sure?"
          open={resetAllFiltersModalOpen}
          setOpen={setResetAllFiltersModalOpen}
          mainText="This action resets all filters in this survey."
          declineBtnLabel="Cancel"
          onDecline={() => {
            setResetAllFiltersModalOpen(false);
          }}
          confirmBtnLabel="Remove all filters"
          onConfirm={() => {
            const updatedSegment = structuredClone(segment);
            if (updatedSegment?.filters) {
              updatedSegment.filters = [];
            }

            setSegment(updatedSegment);
            setResetAllFiltersModalOpen(false);
          }}
        />
      </Collapsible.CollapsibleContent>
    </Collapsible.Root>
  );
}
