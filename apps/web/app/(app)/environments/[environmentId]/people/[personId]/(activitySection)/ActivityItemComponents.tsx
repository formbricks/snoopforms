import { capitalizeFirstLetter } from "@/lib/utils";
import { TActivityFeedItem } from "@formbricks/types/v1/activity";
import { Label, Popover, PopoverContent, PopoverTrigger } from "@formbricks/ui";
import {
  CodeBracketIcon,
  CursorArrowRaysIcon,
  EyeIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { formatDistance } from "date-fns";

export const ActivityItemIcon = ({
  count,
  activityItem,
}: {
  count: number;
  activityItem: TActivityFeedItem;
}) => {
  const displayOnlyIcon = count == 1;
  return (
    <div className="h-12 w-12 rounded-full bg-white p-3 text-slate-500  duration-100 ease-in-out group-hover:scale-110 group-hover:text-slate-600">
      {activityItem.type === "attribute" ? (
        <>{displayOnlyIcon ? <TagIcon /> : <div className="text-lg font-bold">{count}x</div>}</>
      ) : activityItem.type === "display" ? (
        <>{displayOnlyIcon ? <EyeIcon /> : <div className="text-lg font-bold">{count}x</div>}</>
      ) : activityItem.type === "event" ? (
        <div>
          {activityItem.actionType === "code" && (
            <>{displayOnlyIcon ? <CodeBracketIcon /> : <div className="text-lg font-bold">{count}x</div>}</>
          )}
          {activityItem.actionType === "noCode" && (
            <>
              {displayOnlyIcon ? <CursorArrowRaysIcon /> : <div className="text-lg font-bold">{count}x</div>}
            </>
          )}
          {activityItem.actionType === "automatic" && (
            <>{displayOnlyIcon ? <SparklesIcon /> : <div className="text-lg font-bold">{count}x</div>}</>
          )}
        </div>
      ) : (
        <QuestionMarkCircleIcon />
      )}
    </div>
  );
};

export const ActivityItemContent = ({ activityItem }: { activityItem: TActivityFeedItem }) => (
  <div>
    <div className="font-semibold text-slate-700">
      {activityItem.type === "attribute" ? (
        <p>{capitalizeFirstLetter(activityItem.attributeLabel)} added</p>
      ) : activityItem.type === "display" ? (
        <p>Seen survey</p>
      ) : activityItem.type === "event" ? (
        <p>{activityItem.actionLabel} triggered</p>
      ) : (
        <p>Unknown Activity</p>
      )}
    </div>
    <div className="text-sm text-slate-400">
      <time
        dateTime={formatDistance(activityItem.createdAt, new Date(), {
          addSuffix: true,
        })}>
        {formatDistance(activityItem.createdAt, new Date(), {
          addSuffix: true,
        })}
      </time>
    </div>
  </div>
);

export const ActivityItemPopover = ({
  activityItem,
  children,
}: {
  activityItem: TActivityFeedItem;
  children: React.ReactNode;
}) => {
  return (
    <Popover>
      <PopoverTrigger className="group">{children}</PopoverTrigger>
      <PopoverContent className="bg-white">
        <div>
          {activityItem.type === "attribute" ? (
            <div>
              <Label className="font-normal text-slate-400">Attribute Label</Label>
              <p className=" mb-2 text-sm font-medium text-slate-900">{activityItem.attributeLabel}</p>
              <Label className="font-normal text-slate-400">Attribute Value</Label>
              <p className="text-sm font-medium text-slate-900">{activityItem.attributeValue}</p>
            </div>
          ) : activityItem.type === "display" ? (
            <div>
              <Label className="font-normal text-slate-400">Survey Name</Label>
              <p className=" mb-2 text-sm font-medium text-slate-900">{activityItem.displaySurveyName}</p>
            </div>
          ) : activityItem.type === "event" ? (
            <div>
              <div>
                <Label className="font-normal text-slate-400">Action Display Name</Label>
                <p className=" mb-2 text-sm font-medium text-slate-900">{activityItem.actionLabel}</p>{" "}
                <Label className="font-normal text-slate-400">Action Description</Label>
                <p className=" mb-2 text-sm font-medium text-slate-900">
                  {activityItem.actionDescription ? (
                    <span>{activityItem.actionDescription}</span>
                  ) : (
                    <span>-</span>
                  )}
                </p>
                <Label className="font-normal text-slate-400">Action Type</Label>
                <p className="text-sm font-medium text-slate-900">
                  {capitalizeFirstLetter(activityItem.actionType)}
                </p>
              </div>
            </div>
          ) : (
            <QuestionMarkCircleIcon />
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
