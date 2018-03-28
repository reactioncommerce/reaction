import { getPaginatedResponse, namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocRolesInternalId = assocInternalId(namespaces.Roles);
export const assocRolesOpaqueId = assocOpaqueId(namespaces.Roles);
export const decodeRolesOpaqueId = decodeOpaqueIdForNamespace(namespaces.Roles);
export const encodeRolesOpaqueId = encodeOpaqueId(namespaces.Roles);

/* Composed function that fully transforms the Group for response. */
export const xformRolesResponse = assocRolesOpaqueId;

export const getPaginatedRolesResponse = getPaginatedResponse(xformRolesResponse);
