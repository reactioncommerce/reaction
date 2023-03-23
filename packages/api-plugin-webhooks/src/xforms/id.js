import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Webhook: "reaction/webhook",
  Shop: "reaction/shop",
  Product: "reaction/product",
  Tag: "reaction/tag"
};

export const encodeWebhookOpaqueId = encodeOpaqueId(namespaces.Webhook);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const tryDecode = (str, decodeFn) => {
  try {
    return decodeFn(str);
  } catch (error) {
    return str;
  }
};

export const decodeWebhookOpaqueId = (str) => tryDecode(str, decodeOpaqueIdForNamespace(namespaces.Webhook));
export const decodeShopOpaqueId = (str) => tryDecode(str, decodeOpaqueIdForNamespace(namespaces.Shop));
