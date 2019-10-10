import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  FulfillmentMethod: "reaction/fulfillmentMethod",
  Surcharge: "reaction/surcharge",
  Shop: "reaction/shop"
};

export const encodeFulfillmentMethodOpaqueId = encodeOpaqueId(namespaces.FulfillmentMethod);
export const encodeSurchargeOpaqueId = encodeOpaqueId(namespaces.Surcharge);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeFulfillmentMethodOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentMethod);
export const decodeSurchargeOpaqueId = decodeOpaqueIdForNamespace(namespaces.Surcharge);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
