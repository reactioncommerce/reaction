import namespaces from "@reactioncommerce/api-utils/graphql/namespaces.js";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocFulfillmentMethodInternalId = assocInternalId(namespaces.FulfillmentMethod);
export const assocFulfillmentMethodOpaqueId = assocOpaqueId(namespaces.FulfillmentMethod);
export const decodeFulfillmentMethodOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentMethod);
export const encodeFulfillmentMethodOpaqueId = encodeOpaqueId(namespaces.FulfillmentMethod);
