"use client";

import { useState } from "react";

import { TAttributeClass } from "@formbricks/types/attributeClasses";
import { TEnvironment } from "@formbricks/types/environment";
import { TIntegrationItem } from "@formbricks/types/integration";
import { TIntegrationAirtable } from "@formbricks/types/integration/airtable";
import { TSurvey } from "@formbricks/types/surveys";

import Connect from "./Connect";
import Home from "./Home";

interface AirtableWrapperProps {
  environmentId: string;
  airtableArray: TIntegrationItem[];
  airtableIntegration?: TIntegrationAirtable;
  surveys: TSurvey[];
  environment: TEnvironment;
  enabled: boolean;
  webAppUrl: string;
  attributeClasses: TAttributeClass[];
}

export default function AirtableWrapper({
  environmentId,
  airtableArray,
  airtableIntegration,
  surveys,
  environment,
  enabled,
  webAppUrl,
  attributeClasses,
}: AirtableWrapperProps) {
  const [isConnected, setIsConnected_] = useState(
    airtableIntegration ? airtableIntegration.config?.key : false
  );

  const setIsConnected = (data: boolean) => {
    setIsConnected_(data);
  };

  return isConnected && airtableIntegration ? (
    <Home
      airtableArray={airtableArray}
      environmentId={environmentId}
      environment={environment}
      airtableIntegration={airtableIntegration}
      setIsConnected={setIsConnected}
      surveys={surveys}
      attributeClasses={attributeClasses}
    />
  ) : (
    <Connect enabled={enabled} environmentId={environment.id} webAppUrl={webAppUrl} />
  );
}
