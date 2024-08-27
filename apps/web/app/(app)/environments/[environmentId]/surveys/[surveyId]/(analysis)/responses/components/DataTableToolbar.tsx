import { TTableData } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/responses/components/Columns";
import { SelectedResponseSettings } from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/(analysis)/responses/components/SelectedResponseSettings";
import { Table } from "@tanstack/react-table";
import { MoveVerticalIcon, SettingsIcon } from "lucide-react";
import { cn } from "@formbricks/lib/cn";

interface DataTableToolbarProps {
  setIsTableSettingsModalOpen: (isTableSettingsModalOpen: boolean) => void;
  setIsExpanded: (isExpanded: boolean) => void;
  isExpanded: boolean;
  table: Table<TTableData>;
  deleteResponses: (responseIds: string[]) => void;
}

export const DataTableToolbar = ({
  setIsExpanded,
  setIsTableSettingsModalOpen,
  isExpanded,
  table,
  deleteResponses,
}: DataTableToolbarProps) => {
  return (
    <div className="my-2 flex w-full items-center justify-between">
      {table.getFilteredSelectedRowModel().rows.length > 0 ? (
        <SelectedResponseSettings table={table} deleteResponses={deleteResponses} />
      ) : (
        <div></div>
      )}
      <div className="flex space-x-2">
        <div
          onClick={() => setIsTableSettingsModalOpen(true)}
          className="cursor-pointer rounded-md border bg-white hover:border-slate-400">
          <SettingsIcon strokeWidth={1.5} className="m-1 h-6 w-6 p-0.5" />
        </div>
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "cursor-pointer rounded-md border bg-white hover:border-slate-400",
            isExpanded && "bg-black text-white"
          )}>
          <MoveVerticalIcon strokeWidth={1.5} className="m-1 h-6 w-6 p-0.5" />
        </div>
      </div>
    </div>
  );
};
