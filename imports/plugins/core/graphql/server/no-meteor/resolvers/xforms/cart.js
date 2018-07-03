import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocCartInternalId = assocInternalId(namespaces.Cart);
export const assocCartOpaqueId = assocOpaqueId(namespaces.Cart);
export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);
