import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocShopInternalId = assocInternalId(namespaces.Shop);
export const assocShopOpaqueId = assocOpaqueId(namespaces.Shop);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
export const xformShopInput = assocShopInternalId;
