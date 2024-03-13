"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@formbricks/lib/authOptions";
import { hasUserEnvironmentAccess } from "@formbricks/lib/environment/auth";
import { getEnvironment } from "@formbricks/lib/environment/service";
import { getMembershipByUserIdTeamId } from "@formbricks/lib/membership/service";
import { deleteProduct, getProducts, updateProduct } from "@formbricks/lib/product/service";
import { getTeamByEnvironmentId } from "@formbricks/lib/team/service";
import { TEnvironment } from "@formbricks/types/environment";
import { AuthenticationError, AuthorizationError, ResourceNotFoundError } from "@formbricks/types/errors";
import { TProduct, TProductUpdateInput } from "@formbricks/types/product";

export const updateProductAction = async (
  environmentId: string,
  productId: string,
  data: Partial<TProductUpdateInput>
): Promise<TProduct> => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AuthenticationError("Not authenticated");
  }

  // get the environment from service and check if the user is allowed to update the product
  let environment: TEnvironment | null = null;

  try {
    environment = await getEnvironment(environmentId);

    if (!environment) {
      throw new ResourceNotFoundError("Environment", "Environment not found");
    }
  } catch (err) {
    throw err;
  }

  if (!hasUserEnvironmentAccess(session.user.id, environment.id)) {
    throw new AuthorizationError("Not authorized");
  }

  const team = await getTeamByEnvironmentId(environmentId);
  const membership = team ? await getMembershipByUserIdTeamId(session.user.id, team.id) : null;

  if (!membership) {
    throw new AuthorizationError("Not authorized");
  }

  if (membership.role === "viewer" || membership.role === "developer") {
    throw new AuthorizationError("You are not allowed to update products.");
  }

  const updatedProduct = await updateProduct(productId, data);
  return updatedProduct;
};

export const deleteProductAction = async (environmentId: string, userId: string, productId: string) => {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new AuthenticationError("Not authenticated");
  }

  // get the environment from service and check if the user is allowed to update the product
  let environment: TEnvironment | null = null;

  try {
    environment = await getEnvironment(environmentId);

    if (!environment) {
      throw new ResourceNotFoundError("Environment", "Environment not found");
    }
  } catch (err) {
    throw err;
  }

  if (!hasUserEnvironmentAccess(session.user.id, environment.id)) {
    throw new AuthorizationError("Not authorized");
  }

  const team = await getTeamByEnvironmentId(environmentId);
  const membership = team ? await getMembershipByUserIdTeamId(userId, team.id) : null;

  if (membership?.role !== "admin" && membership?.role !== "owner") {
    throw new AuthorizationError("You are not allowed to delete products.");
  }

  const availableProducts = team ? await getProducts(team.id) : null;

  if (!!availableProducts && availableProducts?.length <= 1) {
    throw new Error("You can't delete the last product in the environment.");
  }

  const deletedProduct = await deleteProduct(productId);
  return deletedProduct;
};
