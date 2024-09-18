/* eslint-disable no-console -- logging is allowed in migration scripts */
import { PrismaClient, type Response } from "@prisma/client";

const prisma = new PrismaClient();
const BATCH_SIZE = 20000;
const TRANSACTION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

async function runMigration(): Promise<void> {
  const startTime = Date.now();
  console.log("Starting data migration...");

  await prisma.$transaction(
    async (transactionPrisma) => {
      let totalResponseTransformed = 0;
      let totalDisplaysDeleted = 0;
      let totalDisplaysUpdated = 0;
      let cursor: { id: string } | undefined;

      // Collect display ids to delete at the end (to avoid issues with cursor-based pagination)
      const displayIdsToDelete: string[] = [];

      // Collect displays with responseId to update
      const displayIdsToUpdate: string[] = [];

      // eslint-disable-next-line no-constant-condition, @typescript-eslint/no-unnecessary-condition -- intentional infinite loop until no more displays
      while (true) {
        // Define the type for displays
        interface DisplayWithResponseId {
          id: string;
          responseId: string | null;
        }

        // Fetch displays in batches using cursor-based pagination
        const displays: DisplayWithResponseId[] = await transactionPrisma.display.findMany({
          where: {
            responseId: {
              not: null,
            },
          },
          select: {
            id: true,
            responseId: true,
          },
          orderBy: {
            id: "asc",
          },
          take: BATCH_SIZE,
          cursor,
          skip: cursor ? 1 : 0, // Skip the cursor itself
        });

        if (displays.length === 0) {
          console.log("No more displays found");
          break;
        }

        console.log(`Processing batch of ${String(displays.length)} displays...`);

        // Collect responseIds, filter out any nulls
        const responseIds = displays
          .map((display) => display.responseId)
          .filter((id): id is string => id !== null);

        // Define the type for responses
        interface ResponseIdOnly {
          id: string;
        }

        // Fetch existing responses
        const responses: ResponseIdOnly[] = await transactionPrisma.response.findMany({
          where: {
            id: {
              in: responseIds,
            },
          },
          select: {
            id: true,
          },
        });

        const existingResponseIds = new Set(responses.map((response) => response.id));

        // Separate displays into those to update and those to delete
        const displaysToUpdate: DisplayWithResponseId[] = [];

        for (const display of displays) {
          const responseId = display.responseId;
          if (responseId && existingResponseIds.has(responseId)) {
            displaysToUpdate.push(display);
          } else {
            displayIdsToDelete.push(display.id);
          }
        }

        // Update responses to connect displays
        const updateResponsePromises: Promise<Response>[] = displaysToUpdate.map((display) => {
          if (!display.responseId) {
            throw new Error("Unexpected null responseId");
          }
          return transactionPrisma.response.update({
            where: { id: display.responseId },
            data: { display: { connect: { id: display.id } } },
          });
        });

        // Update displays to set responseId to null using updateMany
        if (displaysToUpdate.length > 0) {
          for (const display of displaysToUpdate) {
            displayIdsToUpdate.push(display.id);
          }
        }

        // Execute updates and deletions in parallel
        await Promise.all([...updateResponsePromises]);

        // Update total counts
        totalResponseTransformed += updateResponsePromises.length;
        totalDisplaysDeleted += displayIdsToDelete.length;
        totalDisplaysUpdated += displaysToUpdate.length;

        console.log(`Batch processed. Total displays updated so far: ${String(totalDisplaysUpdated)}`);

        // Move to the next batch
        cursor = { id: displays[displays.length - 1].id };
      }

      // delete displays
      if (displayIdsToDelete.length > 0) {
        await transactionPrisma.display.deleteMany({
          where: {
            id: {
              in: displayIdsToDelete,
            },
          },
        });
      }

      // update displays
      if (displayIdsToUpdate.length > 0) {
        await transactionPrisma.display.updateMany({
          where: {
            id: {
              in: displayIdsToUpdate,
            },
          },
          data: {
            responseId: null,
          },
        });
      }

      console.log(`${String(totalResponseTransformed)} total responses transformed`);
      console.log(`${String(totalDisplaysUpdated)} total displays updated`);
      console.log(`${String(totalDisplaysDeleted)} total displays deleted`);
    },
    {
      timeout: TRANSACTION_TIMEOUT,
    }
  );

  const endTime = Date.now();
  console.log(`Data migration completed. Total time: ${((endTime - startTime) / 1000).toFixed(2)}s`);
}

function handleError(error: unknown): void {
  console.error("An error occurred during migration:", error);
  process.exit(1);
}

function handleDisconnectError(): void {
  console.error("Failed to disconnect Prisma client");
  process.exit(1);
}

function main(): void {
  runMigration()
    .catch(handleError)
    .finally(() => {
      prisma.$disconnect().catch(handleDisconnectError);
    });
}

main();
