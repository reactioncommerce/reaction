import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocShopInternalId = assocInternalId(namespaces.Shop);
export const assocShopOpaqueId = assocOpaqueId(namespaces.Shop);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
export const xformShopInput = assocShopInternalId;
