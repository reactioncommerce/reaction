import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocProductInternalId = assocInternalId(namespaces.Product);
export const assocProductOpaqueId = assocOpaqueId(namespaces.Product);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const encodeProductOpaqueId = encodeOpaqueId(namespaces.Product);
