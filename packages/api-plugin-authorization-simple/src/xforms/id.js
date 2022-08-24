import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Shop: "reaction/shop"
};

export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
