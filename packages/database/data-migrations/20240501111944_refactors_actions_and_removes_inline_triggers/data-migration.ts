import { createId } from "@paralleldrive/cuid2";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(
    async (tx) => {
      // 1. copy value of name to key for all action classes where type is code
      const actionClasses = await tx.actionClass.findMany({
        where: {
          type: "code",
        },
      });

      for (const actionClass of actionClasses) {
        await tx.actionClass.update({
          where: {
            id: actionClass.id,
          },
          data: {
            key: actionClass.name,
          },
        });
      }

      // 2. find all surveys with inlineTriggers and create action classes for them
      const surveys = await tx.survey.findMany({
        where: {
          inlineTriggers: {
            not: Prisma.JsonNull,
          },
        },
      });

      // 3. Create action classes for inlineTriggers and update survey to use the newly created action classes
      const getActionClassIdByCode = async (code: string, environmentId: string): Promise<string> => {
        const existingActionClass = await tx.actionClass.findFirst({
          where: {
            key: code,
            environmentId: environmentId,
          },
        });

        let codeActionId = "";

        if (existingActionClass) {
          codeActionId = existingActionClass.id;
        } else {
          let codeActionClassName = code;

          // check if there is an existing noCode action class with this name
          const existingNoCodeActionClass = await tx.actionClass.findFirst({
            where: {
              name: code,
              environmentId: environmentId,
              type: "noCode",
            },
          });

          if (existingNoCodeActionClass) {
            codeActionClassName = `${code}--id--${createId()}`;
          }

          // create a new private action for codeConfig
          const codeActionClass = await tx.actionClass.create({
            data: {
              name: codeActionClassName,
              key: code,
              type: "code",
              environment: {
                connect: {
                  id: environmentId,
                },
              },
            },
          });
          codeActionId = codeActionClass.id;
        }

        return codeActionId;
      };

      for (const survey of surveys) {
        const { codeConfig, noCodeConfig } = survey.inlineTriggers ?? {};

        if (
          noCodeConfig &&
          Object.keys(noCodeConfig).length > 0 &&
          (!codeConfig || codeConfig.identifier === "")
        ) {
          // surveys with only noCodeConfig

          // create a new private action for noCodeConfig
          const noCodeActionClass = await tx.actionClass.create({
            data: {
              name: `Custom Action--id--${createId()}`,
              noCodeConfig,
              type: "noCode",
              environment: {
                connect: {
                  id: survey.environmentId,
                },
              },
            },
          });

          // update survey to use the newly created action class
          await tx.survey.update({
            where: {
              id: survey.id,
            },
            data: {
              triggers: {
                create: {
                  actionClassId: noCodeActionClass.id,
                },
              },
            },
          });
        } else if ((!noCodeConfig || Object.keys(noCodeConfig).length === 0) && codeConfig?.identifier) {
          // check if there is an existing action class with the key
          const codeActionId = await getActionClassIdByCode(codeConfig.identifier, survey.environmentId);

          await tx.survey.update({
            where: {
              id: survey.id,
            },
            data: {
              triggers: {
                create: {
                  actionClassId: codeActionId,
                },
              },
            },
          });
        } else if (codeConfig?.identifier && noCodeConfig) {
          // create a new private action for noCodeConfig
          const noCodeActionClass = await tx.actionClass.create({
            data: {
              name: `Custom Action--id--${createId()}`,
              noCodeConfig,
              type: "noCode",
              environment: {
                connect: {
                  id: survey.environmentId,
                },
              },
            },
          });

          // resolve conflct here
          const codeActionId = await getActionClassIdByCode(codeConfig.identifier, survey.environmentId);

          // update survey to use the newly created action classes
          await tx.survey.update({
            where: {
              id: survey.id,
            },
            data: {
              triggers: {
                createMany: {
                  data: [
                    {
                      actionClassId: noCodeActionClass.id,
                    },
                    {
                      actionClassId: codeActionId,
                    },
                  ],
                },
              },
            },
          });
        }
      }
    },
    {
      timeout: 50000,
    }
  );
}

main()
  .catch((e: Error) => {
    console.error("Error during migration: ", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
