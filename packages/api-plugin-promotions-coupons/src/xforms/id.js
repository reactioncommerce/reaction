import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Cart: "reaction/cart",
  Shop: "reaction/shop"
};

export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
