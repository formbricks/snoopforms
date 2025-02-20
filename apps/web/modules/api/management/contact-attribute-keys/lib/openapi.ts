import {
  createContactAttributeKeyEndpoint,
  getContactAttributeKeysEndpoint,
} from "@/modules/api/lib/openapi";
import {
  deleteContactAttributeKeyEndpoint,
  getContactAttributeKeyEndpoint,
  updateContactAttributeKeyEndpoint,
} from "@/modules/api/management/contact-attribute-keys/[contactAttributeKeyId]/lib/openapi";
import { ZodOpenApiPathsObject } from "zod-openapi";

export const contactAttributeKeyPaths: ZodOpenApiPathsObject = {
  "/contact-attribute-keys": {
    get: getContactAttributeKeysEndpoint,
    post: createContactAttributeKeyEndpoint,
  },
  "/contact-attribute-keys/{id}": {
    get: getContactAttributeKeyEndpoint,
    put: updateContactAttributeKeyEndpoint,
    delete: deleteContactAttributeKeyEndpoint,
  },
};
