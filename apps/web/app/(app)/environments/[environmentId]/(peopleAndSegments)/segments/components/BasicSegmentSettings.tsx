"use client";

import {
  deleteBasicSegmentAction,
  updateBasicSegmentAction,
} from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/edit/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { cn } from "@formbricks/lib/cn";
import { isAdvancedSegment } from "@formbricks/lib/segment/utils";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { TBaseFilter, TSegment, ZSegmentFilters } from "@formbricks/types/segment";
import { Button } from "@formbricks/ui/Button";
import { Input } from "@formbricks/ui/Input";
import BasicAddFilterModal from "@formbricks/ui/Targeting/BasicAddFilterModal";
import BasicSegmentEditor from "@formbricks/ui/Targeting/BasicSegmentEditor";

type TBasicSegmentSettingsTabProps = {
  environmentId: string;
  setOpen: (open: boolean) => void;
  initialSegment: TSegment;
  attributeClasses: TAttributeClass[];
};

const BasicSegmentSettings = ({
  environmentId,
  initialSegment,
  setOpen,
  attributeClasses,
}: TBasicSegmentSettingsTabProps) => {
  const router = useRouter();

  const [addFilterModalOpen, setAddFilterModalOpen] = useState(false);
  const [segment, setSegment] = useState<TSegment>(initialSegment);

  const [isUpdatingSegment, setIsUpdatingSegment] = useState(false);
  const [isDeletingSegment, setIsDeletingSegment] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");

  const [isSaveDisabled, setIsSaveDisabled] = useState(false);

  const handleResetState = () => {
    setSegment(initialSegment);
    setOpen(false);

    setTitleError("");
    setDescriptionError("");

    router.refresh();
  };

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

  const handleUpdateSegment = async () => {
    if (!segment.title) {
      setTitleError("Title is required");
      return;
    }

    if (!segment.description) {
      setDescriptionError("Description is required");
      return;
    }

    try {
      setIsUpdatingSegment(true);
      await updateBasicSegmentAction(segment.environmentId, segment.id, {
        title: segment.title,
        description: segment.description ?? "",
        isPrivate: segment.isPrivate,
        filters: segment.filters,
      });

      setIsUpdatingSegment(false);
      toast.success("Segment updated successfully!");
    } catch (err: any) {
      toast.error(`${err.message}`);
      setIsUpdatingSegment(false);
      return;
    }

    setIsUpdatingSegment(false);
    handleResetState();
    router.refresh();
  };

  const handleDeleteSegment = async () => {
    try {
      setIsDeletingSegment(true);
      await deleteBasicSegmentAction(segment.environmentId, segment.id);

      setIsDeletingSegment(false);
      toast.success("Segment deleted successfully!");
      handleResetState();
    } catch (err: any) {
      toast.error(`${err.message}`);
    }

    setIsDeletingSegment(false);
  };

  useEffect(() => {
    // parse the filters to check if they are valid
    const parsedFilters = ZSegmentFilters.safeParse(segment.filters);
    if (!parsedFilters.success) {
      setIsSaveDisabled(true);
    } else {
      setIsSaveDisabled(false);
    }
  }, [segment]);

  if (isAdvancedSegment(segment.filters)) {
    return (
      <p className="text-sm font-semibold text-slate-800">
        This is an advanced segment, you cannot edit it. Please upgrade your plan!
      </p>
    );
  }

  return (
    <>
      <div className="mb-4">
        <div className="rounded-lg bg-slate-50">
          <div className="flex flex-col overflow-auto rounded-lg bg-white">
            <div className="flex w-full items-center gap-4">
              <div className="flex w-1/2 flex-col gap-2">
                <label className="text-sm font-medium text-slate-900">Title</label>
                <div className="relative flex flex-col gap-1">
                  <Input
                    value={segment.title}
                    placeholder="Ex. Power Users"
                    onChange={(e) => {
                      setSegment((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }));

                      if (e.target.value) {
                        setTitleError("");
                      }
                    }}
                    className={cn("w-auto", titleError && "border border-red-500 focus:border-red-500")}
                  />

                  {titleError && (
                    <p className="absolute -bottom-1.5 right-2 bg-white text-xs text-red-500">{titleError}</p>
                  )}
                </div>
              </div>

              <div className="flex w-1/2 flex-col gap-2">
                <label className="text-sm font-medium text-slate-900">Description</label>
                <div className="relative flex flex-col gap-1">
                  <Input
                    value={segment.description ?? ""}
                    placeholder="Ex. Power Users"
                    onChange={(e) => {
                      setSegment((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }));

                      if (e.target.value) {
                        setDescriptionError("");
                      }
                    }}
                    className={cn("w-auto", descriptionError && "border border-red-500 focus:border-red-500")}
                  />

                  {descriptionError && (
                    <p className="absolute -bottom-1.5 right-2 bg-white text-xs text-red-500">
                      {descriptionError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <label className="my-4 text-sm font-medium text-slate-900">Targeting</label>
            <div className="filter-scrollbar flex max-h-96 w-full flex-col gap-4 overflow-auto rounded-lg border border-slate-700 bg-white p-4">
              <BasicSegmentEditor
                environmentId={environmentId}
                segment={segment}
                setSegment={setSegment}
                group={segment.filters}
                attributeClasses={attributeClasses}
              />

              <div>
                <Button variant="secondary" size="sm" onClick={() => setAddFilterModalOpen(true)}>
                  Add Filter
                </Button>
              </div>

              <BasicAddFilterModal
                onAddFilter={(filter) => {
                  handleAddFilterInGroup(filter);
                }}
                open={addFilterModalOpen}
                setOpen={setAddFilterModalOpen}
                attributeClasses={attributeClasses}
              />
            </div>

            <div className="flex w-full items-center justify-between pt-4">
              <Button
                type="button"
                variant="warn"
                loading={isDeletingSegment}
                onClick={() => {
                  handleDeleteSegment();
                }}>
                Delete
              </Button>
              <Button
                variant="darkCTA"
                type="submit"
                loading={isUpdatingSegment}
                onClick={() => {
                  handleUpdateSegment();
                }}
                disabled={isSaveDisabled}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BasicSegmentSettings;
