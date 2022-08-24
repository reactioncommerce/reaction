import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Order: "reaction/order",
  Payment: "reaction/payment",
  Shop: "reaction/shop"
};

export const encodePaymentOpaqueId = encodeOpaqueId(namespaces.Payment);

export const decodeOrderOpaqueId = decodeOpaqueIdForNamespace(namespaces.Order);
export const decodePaymentOpaqueId = decodeOpaqueIdForNamespace(namespaces.Payment);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
