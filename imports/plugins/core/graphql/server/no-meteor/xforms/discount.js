import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocDiscountInternalId = assocInternalId(namespaces.Discount);
export const assocDiscountOpaqueId = assocOpaqueId(namespaces.Discount);
export const decodeDiscountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Discount);
export const encodeDiscountOpaqueId = encodeOpaqueId(namespaces.Discount);
