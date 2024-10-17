"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { TDocumentFilterCriteria } from "@formbricks/types/documents";
import { TInsight, TInsightFilterCriteria } from "@formbricks/types/insights";
import { Button } from "@formbricks/ui/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@formbricks/ui/components/Card";
import { getEnvironmentInsightsAction } from "../actions";
import { InsightLoading } from "./InsightLoading";
import { InsightView } from "./InsightView";

interface InsightsTableProps {
  environmentId: string;
  insightsPerPage: number;
  productName: string;
  statsFrom?: Date;
  documentsPerPage?: number;
}

export const InsightsCard = ({
  statsFrom,
  environmentId,
  productName,
  insightsPerPage: insightsLimit,
  documentsPerPage,
}: InsightsTableProps) => {
  const [insights, setInsights] = useState<TInsight[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const insightsFilter: TInsightFilterCriteria = useMemo(
    () => ({
      documentCreatedAt: {
        min: statsFrom,
      },
    }),
    [statsFrom]
  );

  const documentsFilter: TDocumentFilterCriteria = useMemo(
    () => ({
      createdAt: {
        min: statsFrom,
      },
    }),
    [statsFrom]
  );

  useEffect(() => {
    const fetchInitialInsights = async () => {
      setIsFetching(true);
      setInsights([]);
      const res = await getEnvironmentInsightsAction({
        environmentId: environmentId,
        limit: insightsLimit,
        offset: undefined,
        insightsFilter,
      });
      if (res?.data) {
        if (res.data.length < insightsLimit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
        setInsights(res.data);
        setIsFetching(false);
      }
    };

    fetchInitialInsights();
  }, [environmentId, insightsLimit, insightsFilter]);

  const fetchNextPage = useCallback(async () => {
    setIsFetching(true);
    const res = await getEnvironmentInsightsAction({
      environmentId,
      limit: insightsLimit,
      offset: insights.length,
      insightsFilter,
    });
    if (res?.data) {
      if (res.data.length === 0 || res.data.length < insightsLimit) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      setInsights((prevInsights) => [...prevInsights, ...(res.data || [])]);
      setIsFetching(false);
    }
  }, [environmentId, insights, insightsLimit, insightsFilter]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights for {productName}</CardTitle>
        <CardDescription>All the insights generated from responses across all your surveys</CardDescription>
      </CardHeader>
      <CardContent>
        <InsightView
          insights={insights}
          documentsFilter={documentsFilter}
          isFetching={isFetching}
          documentsPerPage={documentsPerPage}
        />
        {isFetching && <InsightLoading />}
        {hasMore && (
          <div className="flex justify-center py-5">
            <Button onClick={fetchNextPage} variant="secondary" size="sm" loading={isFetching}>
              Load more
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
