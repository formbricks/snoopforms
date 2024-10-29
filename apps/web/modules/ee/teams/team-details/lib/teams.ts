import "server-only";
import { membershipCache } from "@/lib/cache/membership";
import { teamCache } from "@/lib/cache/team";
import { TOrganizationMember, TTeam, ZTeam } from "@/modules/ee/teams/team-details/types/teams";
import { TTeamRole, ZTeamRole } from "@/modules/ee/teams/team-list/types/teams";
import { Prisma, TeamRole } from "@prisma/client";
import { cache as reactCache } from "react";
import { z } from "zod";
import { prisma } from "@formbricks/database";
import { cache } from "@formbricks/lib/cache";
import { validateInputs } from "@formbricks/lib/utils/validate";
import { ZId, ZString } from "@formbricks/types/common";
import {
  AuthorizationError,
  DatabaseError,
  ResourceNotFoundError,
  UnknownError,
} from "@formbricks/types/errors";

export const getTeam = reactCache(
  (teamId: string): Promise<TTeam> =>
    cache(
      async () => {
        validateInputs([teamId, ZId]);
        try {
          const team = await prisma.team.findUnique({
            where: {
              id: teamId,
            },
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          });

          if (!team) {
            throw new ResourceNotFoundError("team", teamId);
          }

          const teamMemberships = await prisma.teamMembership.findMany({
            where: {
              teamId,
            },
            select: {
              role: true,
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  memberships: {
                    where: {
                      organizationId: team.organizationId,
                    },
                    select: {
                      organizationRole: true,
                    },
                  },
                },
              },
            },
          });

          if (!team) {
            throw new ResourceNotFoundError("team", teamId);
          }

          const teamMembers = teamMemberships.map((teamMember) => ({
            role: teamMember.role,
            id: teamMember.user.id,
            name: teamMember.user.name,
            email: teamMember.user.email,
            isRoleEditable:
              teamMember.user.memberships[0].organizationRole !== "owner" &&
              teamMember.user.memberships[0].organizationRole !== "manager",
          }));

          return {
            id: team.id,
            name: team.name,
            teamMembers,
          };
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            throw new DatabaseError(error.message);
          }

          throw error;
        }
      },
      [`getTeam-${teamId}`],
      { tags: [teamCache.tag.byId(teamId)] }
    )()
);

export const updateTeamName = async (teamId: string, name: string): Promise<{ name: string }> => {
  validateInputs([teamId, ZId], [name, ZTeam.shape.name]);
  try {
    const updatedTeam = await prisma.team.update({
      where: {
        id: teamId,
      },
      data: {
        name,
      },
      select: {
        organizationId: true,
        name: true,
        productTeams: {
          select: {
            productId: true,
          },
        },
      },
    });

    teamCache.revalidate({ id: teamId, organizationId: updatedTeam.organizationId });

    for (const productTeam of updatedTeam.productTeams) {
      teamCache.revalidate({ productId: productTeam.productId });
    }

    return { name: updatedTeam.name };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const deleteTeam = async (teamId: string): Promise<boolean> => {
  validateInputs([teamId, ZId]);
  try {
    const deletedTeam = await prisma.team.delete({
      where: {
        id: teamId,
      },
      select: {
        organizationId: true,
        productTeams: {
          select: {
            productId: true,
          },
        },
      },
    });

    teamCache.revalidate({ id: teamId, organizationId: deletedTeam.organizationId });

    for (const productTeam of deletedTeam.productTeams) {
      teamCache.revalidate({ productId: productTeam.productId });
    }

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const updateUserTeamRole = async (
  teamId: string,
  userId: string,
  role: TTeamRole
): Promise<boolean> => {
  validateInputs([teamId, ZId], [userId, ZId], [role, ZTeamRole]);
  try {
    const teamMembership = await prisma.teamMembership.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      select: {
        team: {
          select: {
            organizationId: true,
          },
        },
      },
    });

    if (!teamMembership) {
      throw new ResourceNotFoundError("teamMembership", null);
    }

    const orgMembership = await prisma.membership.findUniqueOrThrow({
      where: {
        userId_organizationId: {
          userId,
          organizationId: teamMembership.team.organizationId,
        },
      },
      select: {
        organizationRole: true,
      },
    });

    if (!orgMembership) {
      throw new ResourceNotFoundError("membership", null);
    }

    if (["owner", "manager"].includes(orgMembership.organizationRole) && role === "contributor") {
      throw new AuthorizationError(`Organization ${orgMembership.organizationRole} cannot be a contributor`);
    }

    await prisma.teamMembership.update({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
      data: {
        role,
      },
    });

    teamCache.revalidate({ id: teamId, userId });

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const removeTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  validateInputs([teamId, ZId], [userId, ZId]);
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        organizationId: true,
        productTeams: {
          where: {
            teamId,
          },
          select: {
            productId: true,
          },
        },
      },
    });

    if (!team) {
      throw new ResourceNotFoundError("team", teamId);
    }

    const teamMembership = await prisma.teamMembership.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!teamMembership) {
      throw new ResourceNotFoundError("teamMembership", null);
    }

    await prisma.teamMembership.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    teamCache.revalidate({
      id: teamId,
      userId,
      organizationId: team.organizationId,
    });

    for (const productTeam of team.productTeams) {
      teamCache.revalidate({ productId: productTeam.productId });
    }

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const getMembersByOrganizationId = reactCache(
  (organizationId: string): Promise<TOrganizationMember[]> =>
    cache(
      async () => {
        validateInputs([organizationId, ZString]);

        try {
          const membersData = await prisma.membership.findMany({
            where: {
              organizationId,
              organizationRole: {
                not: "billing",
              },
            },
            select: {
              user: {
                select: {
                  name: true,
                },
              },
              userId: true,
            },
          });

          const members = membersData.map((member) => {
            return {
              id: member.userId,
              name: member.user?.name || "",
            };
          });

          return members;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            console.error(error);
            throw new DatabaseError(error.message);
          }

          throw new UnknownError("Error while fetching members");
        }
      },
      [`getMembersByOrganizationId-${organizationId}`],
      {
        tags: [membershipCache.tag.byOrganizationId(organizationId)],
      }
    )()
);

export const addTeamMembers = async (teamId: string, userIds: string[]): Promise<boolean> => {
  validateInputs([teamId, ZId], [userIds, z.array(ZId)]);
  try {
    const team = await prisma.team.findUnique({
      where: {
        id: teamId,
      },
      select: {
        organizationId: true,
      },
    });

    if (!team) {
      throw new ResourceNotFoundError("team", teamId);
    }

    for (const userId of userIds) {
      const membership = await prisma.membership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: team.organizationId,
          },
        },
        select: {
          organizationRole: true,
        },
      });

      if (!membership) {
        throw new ResourceNotFoundError("Membership", null);
      }

      let role: TeamRole = "contributor";

      if (membership.organizationRole === "owner" || membership.organizationRole === "manager") {
        role = "admin";
      }

      await prisma.teamMembership.create({
        data: {
          teamId,
          userId,
          role,
        },
      });

      teamCache.revalidate({ userId });
    }

    teamCache.revalidate({ id: teamId, organizationId: team.organizationId });

    return true;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new DatabaseError(error.message);
    }

    throw error;
  }
};

export const getTeamRoleByTeamIdUserId = reactCache(
  (teamId: string, userId: string): Promise<TTeamRole | null> =>
    cache(
      async () => {
        validateInputs([teamId, ZId], [userId, ZId]);
        try {
          const teamMembership = await prisma.teamMembership.findUnique({
            where: {
              teamId_userId: {
                teamId,
                userId,
              },
            },
          });

          if (!teamMembership) {
            return null;
          }

          return teamMembership.role;
        } catch (error) {
          if (error instanceof Prisma.PrismaClientKnownRequestError) {
            throw new DatabaseError(error.message);
          }

          throw error;
        }
      },
      [`getTeamMembershipByTeamIdUserId-${teamId}-${userId}`],
      {
        tags: [teamCache.tag.byId(teamId), membershipCache.tag.byUserId(userId)],
      }
    )()
);
