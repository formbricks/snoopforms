"use server";

import { authenticatedActionClient } from "@/lib/utils/action-client";
import { checkAuthorizationUpdated } from "@/lib/utils/action-client-middleware";
import {
  getOrganizationIdFromEnvironmentId,
  getOrganizationIdFromInsightId,
  getProductIdFromEnvironmentId,
  getProductIdFromInsightId,
} from "@/lib/utils/helper";
import { z } from "zod";
import { getOrganization } from "@formbricks/lib/organization/service";
import { getIsAIEnabled } from "@formbricks/lib/utils/ai";
import { ZId } from "@formbricks/types/common";
import { OperationNotAllowedError } from "@formbricks/types/errors";
import { ZInsight, ZInsightFilterCriteria } from "@formbricks/types/insights";
import { getInsights, updateInsight } from "./lib/insights";
import { getStats } from "./lib/stats";

export const checkAIPermission = async (organizationId: string) => {
  const organization = await getOrganization(organizationId);

  if (!organization) {
    throw new Error("Organization not found");
  }

  const isAIEnabled = await getIsAIEnabled(organization);

  if (!isAIEnabled) {
    throw new OperationNotAllowedError("AI is not enabled for this organization");
  }

  return true;
};

const ZGetEnvironmentInsightsAction = z.object({
  environmentId: ZId,
  limit: z.number().optional(),
  offset: z.number().optional(),
  insightsFilter: ZInsightFilterCriteria.optional(),
});

export const getEnvironmentInsightsAction = authenticatedActionClient
  .schema(ZGetEnvironmentInsightsAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromEnvironmentId(parsedInput.environmentId);
    await checkAuthorizationUpdated({
      userId: ctx.user.id,
      organizationId,
      access: [
        {
          type: "organization",
          roles: ["owner", "manager"],
        },
        {
          type: "productTeam",
          minPermission: "read",
          productId: await getProductIdFromEnvironmentId(parsedInput.environmentId),
        },
      ],
    });

    await checkAIPermission(organizationId);

    return await getInsights(
      parsedInput.environmentId,
      parsedInput.limit,
      parsedInput.offset,
      parsedInput.insightsFilter
    );
  });

const ZGetStatsAction = z.object({
  environmentId: ZId,
  statsFrom: z.date().optional(),
});

export const getStatsAction = authenticatedActionClient
  .schema(ZGetStatsAction)
  .action(async ({ ctx, parsedInput }) => {
    const organizationId = await getOrganizationIdFromEnvironmentId(parsedInput.environmentId);
    await checkAuthorizationUpdated({
      userId: ctx.user.id,
      organizationId,
      access: [
        {
          type: "organization",
          roles: ["owner", "manager"],
        },
        {
          type: "productTeam",
          minPermission: "read",
          productId: await getProductIdFromEnvironmentId(parsedInput.environmentId),
        },
      ],
    });

    await checkAIPermission(organizationId);
    return await getStats(parsedInput.environmentId, parsedInput.statsFrom);
  });

const ZUpdateInsightAction = z.object({
  insightId: ZId,
  data: ZInsight.partial(),
});

export const updateInsightAction = authenticatedActionClient
  .schema(ZUpdateInsightAction)
  .action(async ({ ctx, parsedInput }) => {
    try {
      const organizationId = await getOrganizationIdFromInsightId(parsedInput.insightId);

      await checkAuthorizationUpdated({
        userId: ctx.user.id,
        organizationId,
        access: [
          {
            type: "organization",
            roles: ["owner", "manager"],
          },
          {
            type: "productTeam",
            productId: await getProductIdFromInsightId(parsedInput.insightId),
            minPermission: "readWrite",
          },
        ],
      });

      await checkAIPermission(organizationId);

      return await updateInsight(parsedInput.insightId, parsedInput.data);
    } catch (error) {
      console.error("Error updating insight:", {
        insightId: parsedInput.insightId,
        error,
      });
      if (error instanceof Error) {
        throw new Error(`Failed to update insight: ${error.message}`);
      }
      throw new Error("An unexpected error occurred while updating the insight");
    }
  });
