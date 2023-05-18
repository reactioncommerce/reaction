import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  FulfillmentMethod: "reaction/fulfillmentMethod",
  FulfillmentRestriction: "reaction/flatRateFulfillmentRestriction",
  Shop: "reaction/shop"
};

export const encodeFulfillmentMethodOpaqueId = encodeOpaqueId(namespaces.FulfillmentMethod);
export const encodeFulfillmentRestrictionOpaqueId = encodeOpaqueId(namespaces.FulfillmentRestriction);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeFulfillmentMethodOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentMethod);
export const decodeFulfillmentRestrictionOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentRestriction);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
