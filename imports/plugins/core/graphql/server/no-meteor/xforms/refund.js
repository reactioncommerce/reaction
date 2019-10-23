import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocRefundInternalId = assocInternalId(namespaces.Refund);
export const assocRefundOpaqueId = assocOpaqueId(namespaces.Refund);
export const decodeRefundOpaqueId = decodeOpaqueIdForNamespace(namespaces.Refund);
export const encodeRefundOpaqueId = encodeOpaqueId(namespaces.Refund);
