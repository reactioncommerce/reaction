import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Cart: "reaction/cart",
  FulfillmentGroup: "reaction/fulfillmentGroup",
  FulfillmentMethod: "reaction/fulfillmentMethod"
};

export const encodeFulfillmentMethodOpaqueId = encodeOpaqueId(namespaces.FulfillmentMethod);

export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const decodeFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentGroup);
export const decodeFulfillmentMethodOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentMethod);
