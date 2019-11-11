import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  TaxRate: "reaction/taxRate",
  Shop: "reaction/shop"
};

export const encodeTaxRateOpaqueId = encodeOpaqueId(namespaces.TaxRate);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeTaxRateOpaqueId = decodeOpaqueIdForNamespace(namespaces.TaxRate);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
