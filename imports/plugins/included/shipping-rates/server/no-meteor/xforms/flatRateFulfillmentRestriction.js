import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/id";

const namespace = "reaction/flatRateFulfillmentRestriction";

export const assocFulfillmentRestrictionInternalId = assocInternalId(namespace);
export const assocFulfillmentRestrictionOpaqueId = assocOpaqueId(namespace);
export const decodeFulfillmentRestrictionOpaqueId = decodeOpaqueIdForNamespace(namespace);
export const encodeFulfillmentRestrictionOpaqueId = encodeOpaqueId(namespace);
