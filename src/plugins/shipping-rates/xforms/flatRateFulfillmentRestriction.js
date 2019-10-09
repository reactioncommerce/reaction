import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "../../../xforms/id.js";

const namespace = "reaction/flatRateFulfillmentRestriction";

export const assocFulfillmentRestrictionInternalId = assocInternalId(namespace);
export const assocFulfillmentRestrictionOpaqueId = assocOpaqueId(namespace);
export const decodeFulfillmentRestrictionOpaqueId = decodeOpaqueIdForNamespace(namespace);
export const encodeFulfillmentRestrictionOpaqueId = encodeOpaqueId(namespace);
