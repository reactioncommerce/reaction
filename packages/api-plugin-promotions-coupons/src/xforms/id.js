import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Cart: "reaction/cart",
  Promotion: "reaction/promotion"
};

export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);
export const encodePromotionOpaqueId = encodeOpaqueId(namespaces.Promotion);

export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const decodePromotionOpaqueId = decodeOpaqueIdForNamespace(namespaces.Promotion);
