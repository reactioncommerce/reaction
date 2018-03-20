import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocShopOpaqueId = assocOpaqueId(namespaces.Shop);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

/* Composed function that fully transforms the Shop ID for response. */
export const xformShopResponse = assocShopOpaqueId;
