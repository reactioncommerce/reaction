import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocPaymentInternalId = assocInternalId(namespaces.Payment);
export const assocPaymentOpaqueId = assocOpaqueId(namespaces.Payment);
export const decodePaymentOpaqueId = decodeOpaqueIdForNamespace(namespaces.Payment);
export const encodePaymentOpaqueId = encodeOpaqueId(namespaces.Payment);
