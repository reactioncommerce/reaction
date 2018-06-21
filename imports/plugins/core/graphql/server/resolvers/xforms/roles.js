import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocRoleInternalId = assocInternalId(namespaces.Role);
export const assocRoleOpaqueId = assocOpaqueId(namespaces.Role);
export const decodeRoleOpaqueId = decodeOpaqueIdForNamespace(namespaces.Role);
export const encodeRoleOpaqueId = encodeOpaqueId(namespaces.Role);
