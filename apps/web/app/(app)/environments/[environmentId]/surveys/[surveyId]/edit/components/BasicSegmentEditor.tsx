import { deleteResource, isResourceFilter, moveResource } from "@formbricks/lib/segment/utils";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { TBaseFilters, TSegment } from "@formbricks/types/segment";

import BasicSegmentFilter from "./BasicSegmentFilter";

type TSegmentFilterProps = {
  group: TBaseFilters;
  environmentId: string;
  segment: TSegment;
  attributeClasses: TAttributeClass[];
  setSegment: React.Dispatch<React.SetStateAction<TSegment>>;
};

const BasicSegmentEditor = ({
  group,
  environmentId,
  setSegment,
  segment,
  attributeClasses,
}: TSegmentFilterProps) => {
  const handleMoveResource = (resourceId: string, direction: "up" | "down") => {
    const localSegmentCopy = structuredClone(segment);
    if (localSegmentCopy.filters) {
      moveResource(localSegmentCopy.filters, resourceId, direction);
    }

    setSegment(localSegmentCopy);
  };

  const handleDeleteResource = (resourceId: string) => {
    const localSegmentCopy = structuredClone(segment);

    if (localSegmentCopy.filters) {
      deleteResource(localSegmentCopy.filters, resourceId);
    }

    setSegment(localSegmentCopy);
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg">
      {group?.map((groupItem) => {
        const { connector, resource, id: groupId } = groupItem;

        if (isResourceFilter(resource)) {
          return (
            <BasicSegmentFilter
              key={groupId}
              connector={connector}
              resource={resource}
              environmentId={environmentId}
              segment={segment}
              attributeClasses={attributeClasses}
              setSegment={setSegment}
              onDeleteFilter={(filterId: string) => handleDeleteResource(filterId)}
              onMoveFilter={(filterId: string, direction: "up" | "down") =>
                handleMoveResource(filterId, direction)
              }
            />
          );
        } else {
          return null;
        }
      })}
    </div>
  );
};

export default BasicSegmentEditor;
