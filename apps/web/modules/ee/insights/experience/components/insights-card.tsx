"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@formbricks/ui/components/Card";
import { InsightView } from "./insight-view";

interface InsightsCardProps {
  environmentId: string;
  insightsPerPage: number;
  productName: string;
  statsFrom?: Date;
  documentsPerPage: number;
}

export const InsightsCard = ({
  statsFrom,
  environmentId,
  productName,
  insightsPerPage: insightsLimit,
  documentsPerPage,
}: InsightsCardProps) => {
  const t = useTranslations();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("environments.experience.insights_for_product", { productName })}</CardTitle>
        <CardDescription>{t("environments.experience.insights_description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <InsightView
          statsFrom={statsFrom}
          environmentId={environmentId}
          documentsPerPage={documentsPerPage}
          insightsPerPage={insightsLimit}
        />
      </CardContent>
    </Card>
  );
};
