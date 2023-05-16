"use client";

import SurveyStatusDropdown from "@/components/shared/SurveyStatusDropdown";
import { useProduct } from "@/lib/products/products";
import { useSurveyMutation } from "@/lib/surveys/mutateSurveys";
import type { Survey } from "@formbricks/types/surveys";
import { Button, Input } from "@formbricks/ui";
import { ArrowLeftIcon, Cog8ToothIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface SurveyMenuBarProps {
  localSurvey: Survey;
  setLocalSurvey: (survey: Survey) => void;
  environmentId: string;
  activeId: "questions" | "settings";
  setActiveId: (id: "questions" | "settings") => void;
}

export default function SurveyMenuBar({
  localSurvey,
  environmentId,
  setLocalSurvey,
  activeId,
  setActiveId,
}: SurveyMenuBarProps) {
  const router = useRouter();
  const { triggerSurveyMutate, isMutatingSurvey } = useSurveyMutation(environmentId, localSurvey.id);
  const [audiencePrompt, setAudiencePrompt] = useState(true);
  const { product } = useProduct(environmentId);

  useEffect(() => {
    if (audiencePrompt && activeId === "settings") {
      setAudiencePrompt(false);
    }
  }, [activeId, audiencePrompt]);

  // write a function which updates the local survey status
  const updateLocalSurveyStatus = (status: Survey["status"]) => {
    const updatedSurvey = { ...localSurvey, status };
    setLocalSurvey(updatedSurvey);
  };

  return (
    <div className="border-b border-slate-200 bg-white px-5 py-3 sm:flex sm:items-center sm:justify-between">
      <div className="flex items-center space-x-2 whitespace-nowrap">
        <Button
          variant="secondary"
          StartIcon={ArrowLeftIcon}
          onClick={() => {
            router.back();
          }}>
          {/*  <ArrowLeftIcon className="h-5 w-5 text-slate-700" /> */} Back
        </Button>
        <p className="pl-4 font-semibold">{product.name} / </p>
        <Input
          defaultValue={localSurvey.name}
          onChange={(e) => {
            const updatedSurvey = { ...localSurvey, name: e.target.value };
            setLocalSurvey(updatedSurvey);
          }}
          className="w-72 border-white hover:border-slate-200 "
        />
        {localSurvey?.responseRate && (
          <div className="flex items-center rounded-full border border-amber-200 bg-amber-100 p-2 text-sm text-amber-700 shadow-sm">
            <ExclamationTriangleIcon className="mr-2 h-5 w-5 text-amber-400" />
            This survey received responses. To keep the data consistent, make changes with caution.
          </div>
        )}
      </div>
      <div className="mt-3 flex sm:ml-4 sm:mt-0">
        <div className="mr-4 flex items-center">
          <SurveyStatusDropdown
            surveyId={localSurvey.id}
            environmentId={environmentId}
            updateLocalSurveyStatus={updateLocalSurveyStatus}
          />
        </div>
        <Button
          variant="secondary"
          className="mr-3"
          loading={isMutatingSurvey}
          onClick={() => {
            triggerSurveyMutate({ ...localSurvey })
              .then(() => {
                toast.success("Changes saved.");
              })
              .catch((error) => {
                toast.error(`Error: ${error.message}`);
              });
            if (localSurvey.status !== "draft") {
              router.push(`/environments/${environmentId}/surveys/${localSurvey.id}/summary`);
            }
          }}>
          Save
        </Button>
        {localSurvey.status === "draft" && audiencePrompt && (
          <Button
            variant="darkCTA"
            onClick={() => {
              setAudiencePrompt(false);
              setActiveId("settings");
            }}
            EndIcon={Cog8ToothIcon}>
            Continue to Settings
          </Button>
        )}
        {localSurvey.status === "draft" && !audiencePrompt && (
          <Button
            disabled={
              localSurvey.type === "web" &&
              (localSurvey.triggers[0] === "" || localSurvey.triggers.length === 0)
            }
            variant="darkCTA"
            loading={isMutatingSurvey}
            onClick={async () => {
              await triggerSurveyMutate({ ...localSurvey, status: "inProgress" });
              router.push(`/environments/${environmentId}/surveys/${localSurvey.id}/summary?success=true`);
            }}>
            Publish
          </Button>
        )}
      </div>
    </div>
  );
}
