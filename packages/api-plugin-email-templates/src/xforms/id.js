import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Shop: "reaction/shop",
  Template: "reaction/template"
};

export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
export const encodeTemplateOpaqueId = encodeOpaqueId(namespaces.Template);

export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
export const decodeTemplateOpaqueId = decodeOpaqueIdForNamespace(namespaces.Template);
