"use client";

import AddFilterModal from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/AddFilterModal";
import LoadSegmentModal from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/LoadSegmentModal";
import SaveAsNewSegmentModal from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/SaveAsNewSegmentModal";
import SegmentAlreadyUsedModal from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/SegmentAlreadyUsedModal";
import SegmentFilters from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/SegmentFilters";
import { cloneUserSegmentAction } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/actions";
import AlertDialog from "@/components/shared/AlertDialog";
import { TBaseFilterGroupItem, TUserSegment } from "@formbricks/types/v1/userSegment";
import { CheckCircleIcon, ExclamationCircleIcon, UserGroupIcon } from "@heroicons/react/24/solid";
import * as Collapsible from "@radix-ui/react-collapsible";
import { produce } from "immer";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { cn } from "@formbricks/lib/cn";
import { Badge, Button } from "@formbricks/ui";
import { TSurveyWithAnalytics } from "@formbricks/types/v1/surveys";

interface WhoToSendCardProps {
  localSurvey: TSurveyWithAnalytics;
  setLocalSurvey: (survey: TSurveyWithAnalytics) => void;
  environmentId: string;
}

export default function WhoToSendCard({ localSurvey, setLocalSurvey, environmentId }: WhoToSendCardProps) {
  const [open, setOpen] = useState(false);

  const [userSegment, setUserSegment] = useState<TUserSegment | null>(localSurvey.userSegment ?? null);

  const [addFilterModalOpen, setAddFilterModalOpen] = useState(false);
  const [saveAsNewSegmentModalOpen, setSaveAsNewSegmentModalOpen] = useState(false);
  const [resetAllFiltersModalOpen, setResetAllFiltersModalOpen] = useState(false);
  const [loadSegmentModalOpen, setLoadSegmentModalOpen] = useState(false);
  const [loadSegmentModalStep, setLoadSegmentModalStep] = useState<"initial" | "load">("initial");
  const [isSegmentEditorOpen, setIsSegmentEditorOpen] = useState(localSurvey.userSegment?.isPrivate);
  const [segmentUsedModalOpen, setSegmentUsedModalOpen] = useState(false);
  const [segmentEditorViewOnly, setSegmentEditorViewOnly] = useState(false);

  // sync local survey with user segment
  useEffect(() => {
    const updatedLocalSurvey = produce(localSurvey, (draft) => {
      draft.userSegmentId = userSegment?.id ?? null;
      draft.userSegment = userSegment;
    });

    setLocalSurvey(updatedLocalSurvey);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLocalSurvey, userSegment]);

  const isSegmentUsedInOtherSurveys = useMemo(
    () => (localSurvey?.userSegment ? localSurvey.userSegment?.surveys?.length > 1 : false),
    [localSurvey.userSegment]
  );

  const handleCloneSegment = async () => {
    if (!userSegment) return;

    try {
      const clonedUserSegment = await cloneUserSegmentAction(userSegment.id, localSurvey.id);

      setUserSegment(clonedUserSegment);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // useEffect(() => {
  //   if (!isLoadingAttributeClasses) {
  //     if (localSurvey.attributeFilters?.length > 0) {
  //       setOpen(true);
  //     }
  //   }

  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoadingAttributeClasses]);

  useEffect(() => {
    if (!!userSegment && userSegment?.filters?.length > 0) {
      setOpen(true);
    }
  }, [userSegment, userSegment?.filters?.length]);

  useEffect(() => {
    if (localSurvey.type === "link") {
      setOpen(false);
    }
  }, [localSurvey.type]);

  // const addAttributeFilter = () => {
  //   const updatedSurvey = { ...localSurvey };
  //   updatedSurvey.attributeFilters = [
  //     ...localSurvey.attributeFilters,
  //     { attributeClassId: "", condition: filterConditions[0].id, value: "" },
  //   ];
  //   setLocalSurvey(updatedSurvey);
  // };

  // const setAttributeFilter = (idx: number, attributeClassId: string, condition: string, value: string) => {
  //   const updatedSurvey = { ...localSurvey };
  //   updatedSurvey.attributeFilters[idx] = { attributeClassId, condition, value };
  //   setLocalSurvey(updatedSurvey);
  // };

  // const removeAttributeFilter = (idx: number) => {
  //   const updatedSurvey = { ...localSurvey };
  //   updatedSurvey.attributeFilters = [
  //     ...localSurvey.attributeFilters.slice(0, idx),
  //     ...localSurvey.attributeFilters.slice(idx + 1),
  //   ];
  //   setLocalSurvey(updatedSurvey);
  // };

  const handleAddFilterInGroup = (filter: TBaseFilterGroupItem) => {
    const updatedUserSegment = produce(userSegment, (draft) => {
      if (draft?.filters?.length === 0) {
        draft.filters.push({
          ...filter,
          connector: null,
        });
      } else {
        draft?.filters.push(filter);
      }
    });

    setUserSegment(updatedUserSegment);
  };

  return (
    <>
      <Collapsible.Root
        open={open}
        onOpenChange={(openState) => {
          if (localSurvey.type !== "link") {
            setOpen(openState);
          }
        }}
        className="w-full rounded-lg border border-slate-300 bg-white">
        <Collapsible.CollapsibleTrigger
          asChild
          className={cn(
            localSurvey.type !== "link"
              ? "cursor-pointer hover:bg-slate-50"
              : "cursor-not-allowed bg-slate-50",
            "h-full w-full rounded-lg"
          )}>
          <div className="inline-flex px-4 py-6">
            <div className="flex items-center pl-2 pr-5">
              <CheckCircleIcon
                className={cn(localSurvey.type !== "link" ? "text-green-400" : "text-slate-300", "h-8 w-8 ")}
              />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Target Audience</p>
              <p className="mt-1 text-sm text-slate-500">Pre-segment your users with attributes filters.</p>
            </div>
            {localSurvey.type === "link" && (
              <div className="flex w-full items-center justify-end pr-2">
                <Badge size="normal" text="In-app survey settings" type="gray" />
              </div>
            )}
          </div>
        </Collapsible.CollapsibleTrigger>
        <Collapsible.CollapsibleContent className="min-w-full overflow-auto">
          <hr className="py-1 text-slate-600" />

          <div className="flex flex-col gap-2 p-6">
            {!userSegment?.filters?.length && (
              <div className="mb-4 flex w-full items-center gap-4 rounded-lg border border-amber-200 bg-amber-50 px-6 py-4 text-amber-800">
                <ExclamationCircleIcon className="h-6 w-6 text-amber-500" />
                <div className="flex flex-col">
                  <h3 className="text-base font-medium">Currently, all users are targeted.</h3>
                  <p className="text-sm">Without a filter, all of your users can be surveyed.</p>
                </div>
              </div>
            )}

            <div className="filter-scrollbar flex flex-col gap-4 overflow-auto rounded-lg border-2 border-slate-300 bg-white p-4">
              <SegmentAlreadyUsedModal
                open={segmentUsedModalOpen}
                setOpen={setSegmentUsedModalOpen}
                environmentId={environmentId}
              />

              {!!userSegment && (
                <LoadSegmentModal
                  open={loadSegmentModalOpen}
                  setOpen={setLoadSegmentModalOpen}
                  surveyId={localSurvey.id}
                  environmentId={localSurvey.environmentId}
                  step={loadSegmentModalStep}
                  setStep={setLoadSegmentModalStep}
                  userSegment={userSegment}
                  setUserSegment={setUserSegment}
                  setIsSegmentEditorOpen={setIsSegmentEditorOpen}
                />
              )}

              {segmentEditorViewOnly && userSegment && (
                <div className="pointer-events-none opacity-60">
                  <SegmentFilters
                    key={userSegment.filters.toString()}
                    group={userSegment.filters}
                    environmentId={environmentId}
                    userSegment={userSegment}
                    setUserSegment={setUserSegment}
                  />
                </div>
              )}

              {isSegmentEditorOpen ? (
                <div className="w-full">
                  <div className="mb-4">
                    <p className="text-sm font-semibold">Send survey to audience who match...</p>
                    <p className="text-sm">Without a filter, all of your users can be surveyed.</p>
                  </div>
                  {!!userSegment?.filters?.length && (
                    <div className="w-full">
                      <SegmentFilters
                        key={userSegment.filters.toString()}
                        group={userSegment.filters}
                        environmentId={environmentId}
                        userSegment={userSegment}
                        setUserSegment={setUserSegment}
                      />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4">
                    <Button variant="secondary" size="sm" onClick={() => setAddFilterModalOpen(true)}>
                      Add filter
                    </Button>

                    {isSegmentEditorOpen && !!userSegment?.filters?.length && (
                      <Button
                        variant="minimal"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setResetAllFiltersModalOpen(true)}>
                        <p className="text-sm">Reset all filters</p>
                      </Button>
                    )}
                  </div>

                  <>
                    <AddFilterModal
                      environmentId={environmentId}
                      onAddFilter={(filter) => {
                        handleAddFilterInGroup(filter);
                      }}
                      open={addFilterModalOpen}
                      setOpen={setAddFilterModalOpen}
                    />
                    {!!userSegment && (
                      <SaveAsNewSegmentModal
                        open={saveAsNewSegmentModalOpen}
                        setOpen={setSaveAsNewSegmentModalOpen}
                        localSurvey={localSurvey}
                        userSegment={userSegment}
                        setUserSegment={setUserSegment}
                        setIsSegmentEditorOpen={setIsSegmentEditorOpen}
                      />
                    )}

                    <AlertDialog
                      headerText="Are you sure?"
                      open={resetAllFiltersModalOpen}
                      setOpen={setResetAllFiltersModalOpen}
                      mainText="This action resets all filters in this survey."
                      declineBtnLabel="Cancel"
                      onFirstBtnClick={() => {
                        setResetAllFiltersModalOpen(false);
                      }}
                      confirmBtnLabel="Ok"
                      onSecondBtnClick={() => {
                        const updatedUserSegment = produce(userSegment, (draft) => {
                          if (draft?.filters) {
                            draft.filters = [];
                          }
                        });

                        setUserSegment(updatedUserSegment);
                        setResetAllFiltersModalOpen(false);
                      }}
                    />
                  </>
                </div>
              ) : (
                <div className="flex flex-col gap-4 rounded-lg p-2">
                  <div className="mb-2 flex items-center gap-6">
                    <UserGroupIcon className="h-6 w-6 text-slate-700" />
                    <div className="flex flex-col">
                      <h3 className="font-medium text-slate-900">{localSurvey.userSegment?.title}</h3>
                      <p className="text-sm text-slate-500">{localSurvey.userSegment?.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSegmentEditorViewOnly(!segmentEditorViewOnly);
                        }}>
                        {segmentEditorViewOnly ? "Hide" : "View"} Filters
                      </Button>
                    </div>

                    {isSegmentUsedInOtherSurveys && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => handleCloneSegment()}>
                        <p className="text-sm">Clone segment</p>
                      </Button>
                    )}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-2"
                      onClick={() => {
                        if (isSegmentUsedInOtherSurveys) {
                          setSegmentUsedModalOpen(true);
                        } else {
                          setIsSegmentEditorOpen(true);
                          setSegmentEditorViewOnly(false);
                        }
                      }}>
                      <p className="text-sm">Edit Segment</p>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex w-full gap-4">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-2 text-sm"
                onClick={() => setLoadSegmentModalOpen(true)}>
                Load Segment
              </Button>

              {isSegmentEditorOpen && !!userSegment?.filters?.length && (
                <Button
                  variant="minimal"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={() => setSaveAsNewSegmentModalOpen(true)}>
                  <p className="text-sm">Save as new Segment</p>
                </Button>
              )}
            </div>
          </div>
        </Collapsible.CollapsibleContent>
      </Collapsible.Root>
    </>
  );
}
