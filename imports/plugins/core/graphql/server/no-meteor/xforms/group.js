import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocGroupInternalId = assocInternalId(namespaces.Group);
export const assocGroupOpaqueId = assocOpaqueId(namespaces.Group);
export const decodeGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.Group);
export const encodeGroupOpaqueId = encodeOpaqueId(namespaces.Group);
