import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Address: "reaction/address",
  AddressValidationRule: "reaction/addressValidationRule",
  Shop: "reaction/shop"
};

export const encodeAddressOpaqueId = encodeOpaqueId(namespaces.Address);
export const encodeAddressValidationRuleOpaqueId = encodeOpaqueId(namespaces.AddressValidationRule);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeAddressOpaqueId = decodeOpaqueIdForNamespace(namespaces.Address);
export const decodeAddressValidationRuleOpaqueId = decodeOpaqueIdForNamespace(namespaces.AddressValidationRule);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
