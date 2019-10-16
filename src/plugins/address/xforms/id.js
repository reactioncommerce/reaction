import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Address: "reaction/address",
  Shop: "reaction/shop"
};

export const encodeAddressOpaqueId = encodeOpaqueId(namespaces.Address);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeAddressOpaqueId = decodeOpaqueIdForNamespace(namespaces.Address);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
