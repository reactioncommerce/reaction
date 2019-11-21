import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Job: "reaction/job",
  Shop: "reaction/shop"
};

export const encodeJobOpaqueId = encodeOpaqueId(namespaces.Job);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeJobOpaqueId = decodeOpaqueIdForNamespace(namespaces.Job);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);
