import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

export const encodeCatalogItemOpaqueId = encodeOpaqueId("reaction/catalogItem");
export const encodeCatalogProductOpaqueId = encodeOpaqueId("reaction/catalogProduct");
export const encodeCatalogProductVariantOpaqueId = encodeOpaqueId("reaction/catalogProductVariant");
export const encodeProductOpaqueId = encodeOpaqueId("reaction/product");
export const encodeTagOpaqueId = encodeOpaqueId("reaction/tag");

export const decodeCatalogItemOpaqueId = decodeOpaqueIdForNamespace("reaction/catalogItem");
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace("reaction/product");
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace("reaction/shop");
export const decodeTagOpaqueId = decodeOpaqueIdForNamespace("reaction/tag");
