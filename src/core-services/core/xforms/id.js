import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

export const encodeAddressOpaqueId = encodeOpaqueId("reaction/address");
export const encodeTagOpaqueId = encodeOpaqueId("reaction/tag");

export const decodeShopOpaqueId = decodeOpaqueIdForNamespace("reaction/shop");
export const decodeTagOpaqueId = decodeOpaqueIdForNamespace("reaction/tag");
