import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Shop: "reaction/shop"
};

export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);
