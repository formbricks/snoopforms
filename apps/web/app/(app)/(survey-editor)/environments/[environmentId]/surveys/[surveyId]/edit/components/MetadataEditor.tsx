import omit from "lodash/omit";
import {
  ArrowDownIcon,
  BracesIcon,
  ChevronDown,
  CornerDownRightIcon,
  HelpCircle,
  TrashIcon,
} from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { getLocalizedValue } from "@formbricks/lib/i18n/utils";
import { structuredClone } from "@formbricks/lib/pollyfills/structuredClone";
import { replaceHeadlineRecall } from "@formbricks/lib/utils/recall";
import { TAttributeClass } from "@formbricks/types/attributeClasses";
import {
  TSurvey,
  TSurveyLogicCondition,
  TSurveyQuestion,
  TSurveyQuestionTypeEnum,
  TSurveyRequirementsLogic,
} from "@formbricks/types/surveys";
import { Button } from "@formbricks/ui/Button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@formbricks/ui/DropdownMenu";
import { Input } from "@formbricks/ui/Input";
import { Label } from "@formbricks/ui/Label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@formbricks/ui/Select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@formbricks/ui/Tooltip";

const NEW_META_KEY = "___NEW_META_KEY___";

type MetaItem = {
  key: string;
  value: string;
};

interface MetadataFieldItemProps {
  item: MetaItem;
  onChange?: (item: MetaItem) => void;
  onBlur?: (item: MetaItem) => void;
  onDelete?: () => void;
}
export const MetadataFieldItem: React.FunctionComponent<MetadataFieldItemProps> = (props) => {
  const { item, onChange, onBlur, onDelete } = props;

  const [tmpItem, setTempItem] = React.useState<MetaItem>(item);
  const [emitChange, setEmitChange] = React.useState(false);
  const [emitBlur, setEmitBlur] = React.useState(false);

  const handleUpdateLocalItem = React.useCallback(
    (type: keyof MetaItem, value: string, ensureKey: boolean = false) => {
      const val = ensureKey && type === "key" && value === "" ? item.key : value;
      setTempItem((item) => ({
        ...item,
        [type]: val,
      }));
    },
    [item.key]
  );

  const handleChange = React.useCallback(
    (type: keyof MetaItem, value: string) => {
      handleUpdateLocalItem(type, value);

      if (onChange) setEmitChange(true);
    },
    [handleUpdateLocalItem, onChange]
  );

  const handleBlur = React.useCallback(
    (type: keyof MetaItem, value: string) => {
      handleUpdateLocalItem(type, value, true);
      if (onBlur) setEmitBlur(true);
    },
    [handleUpdateLocalItem, onBlur]
  );

  React.useEffect(() => {
    if (onChange && emitChange) {
      onChange(tmpItem);
      setEmitChange(false);
    }

    if (onBlur && emitBlur) {
      onBlur(tmpItem);
      setEmitBlur(false);
    }
  }, [emitBlur, emitChange, onBlur, onChange, tmpItem]);

  return (
    <>
      {/* <p> real item key:{item.key} value:{item.value}  </p> */}
      <div className="flex items-center space-x-2 text-xs xl:text-sm">
        <Input
          autoFocus
          placeholder="Key"
          className="mb-1 w-full bg-white"
          onChange={(e) => handleChange("key", e.target.value)}
          onBlur={(e) => handleBlur("key", e.target.value)}
          value={tmpItem.key !== NEW_META_KEY ? tmpItem.key : ""}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <Input
          autoFocus
          disabled={item.key === NEW_META_KEY}
          placeholder="Value"
          className="mb-1 w-full bg-white"
          onChange={(e) => handleChange("value", e.target.value)}
          onBlur={(e) => handleBlur("value", e.target.value)}
          // onChange={onChange ? (e) => {
          //   console.log("on change", e.target.value);
          //   onChange({ key, value: e.target.value });

          // }: undefined}
          // onBlur={onBlur ? (e) => {
          //   console.log("on blur", e.target.value);
          //   onBlur && onBlur({ key, value: e.target.value });
          // }:undefined}
          value={tmpItem.value}
          onKeyDown={(e) => e.stopPropagation()}
        />

        <TrashIcon className="h-4 w-4 cursor-pointer text-slate-400" onClick={onDelete} />
      </div>
    </>
  );
};

interface MetadataFieldProps {
  label?: string;
  value?: Record<string, string>;
  onChange?: (data: Record<string, string>) => void;
}

export const MetadataField: React.FunctionComponent<MetadataFieldProps> = (props) => {
  const { value = {}, onChange, label } = props;

  const [showEmptyItem, setShowEmptyItem] = React.useState(false);

  const addNewMetadata = React.useCallback(() => {
    setShowEmptyItem(true);
    // onChange && onChange({ ...value, [NEW_META_KEY]: "" });
  }, []);

  const handleItemChange = React.useCallback(
    (prevValue: MetaItem, newValue: MetaItem) => {
      // console.log("handleItemChange", prevValue, newValue);
      if (newValue.key === NEW_META_KEY || newValue.key === "") {
        // console.log("SKip change");
        return;
      }

      if (prevValue.key === NEW_META_KEY) {
        setShowEmptyItem(false);
      }
      onChange && onChange({ ...omit(value, prevValue.key), [newValue.key]: newValue.value });
    },
    [onChange, value]
  );

  const handleDelete = React.useCallback(
    (key: string) => {
      // console.log("handleDelete", key);
      if (key === NEW_META_KEY) {
        setShowEmptyItem(false);
      } else {
        onChange && onChange(omit(value, key));
      }
    },
    [onChange, value]
  );

  const entries = React.useMemo(() => {
    const entries = Object.entries(value);
    if (showEmptyItem) {
      entries.push([NEW_META_KEY, ""]);
    }
    return entries;
  }, [showEmptyItem, value]);

  return (
    <>
      {label && <Label>{label}</Label>}

      {entries.length > 0 ? (
        entries.map(([key, value]) => {
          return (
            <MetadataFieldItem
              key={key}
              item={{ key, value }}
              onBlur={(newValue) => handleItemChange({ key, value }, newValue)}
              onDelete={() => handleDelete(key)}
            />
          );
        })
      ) : (
        <div className="flex flex-wrap items-center space-x-2 py-1 text-sm">
          <p className="text-slate-700">No Metadata assigned</p>
        </div>
      )}

      <div className="mt-2 flex items-center space-x-2">
        <Button
          disabled={showEmptyItem}
          id="New Metadata"
          className="bg-slate-100 hover:bg-slate-50"
          type="button"
          name="new meta"
          size="sm"
          variant="secondary"
          StartIcon={BracesIcon}
          onClick={() => addNewMetadata()}>
          Add Metadata
        </Button>
        <TooltipProvider delayDuration={50}>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="ml-2 inline h-4 w-4 cursor-default text-slate-500" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[300px]" side="top">
              Add your metadata to the question
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
};

interface MetadataEditorProps {
  localSurvey: TSurvey;
  questionIdx: number;
  question: TSurveyQuestion;
  updateQuestion: (questionIdx: number, updatedAttributes: any) => void;
  attributeClasses: TAttributeClass[];
}

export const MetadataEditor = ({
  localSurvey,
  question,
  questionIdx,
  updateQuestion,
  attributeClasses,
}: MetadataEditorProps) => {
  localSurvey = useMemo(() => {
    return replaceHeadlineRecall(localSurvey, "default", attributeClasses);
  }, [localSurvey, attributeClasses]);

  const updateMetadata = (metadata: TSurveyQuestion["metadata"]) => {
    updateQuestion(questionIdx, { metadata });
  };

  return (
    <div className="mt-3">
      <MetadataField label={"Metadata"} value={question.metadata} onChange={updateMetadata}></MetadataField>
    </div>
  );
};
