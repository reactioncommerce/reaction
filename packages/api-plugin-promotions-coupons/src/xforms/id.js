import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Cart: "reaction/cart"
};

export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);

export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
