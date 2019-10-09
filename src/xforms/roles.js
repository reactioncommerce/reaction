import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocRoleInternalId = assocInternalId(namespaces.Role);
export const assocRoleOpaqueId = assocOpaqueId(namespaces.Role);
export const decodeRoleOpaqueId = decodeOpaqueIdForNamespace(namespaces.Role);
export const encodeRoleOpaqueId = encodeOpaqueId(namespaces.Role);
