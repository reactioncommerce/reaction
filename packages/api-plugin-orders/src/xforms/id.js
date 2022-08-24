import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";

const namespaces = {
  Account: "reaction/account",
  Cart: "reaction/cart",
  FulfillmentMethod: "reaction/fulfillmentMethod",
  Order: "reaction/order",
  OrderFulfillmentGroup: "reaction/orderFulfillmentGroup",
  OrderItem: "reaction/orderItem",
  Payment: "reaction/payment",
  Product: "reaction/product",
  Refund: "reaction/refund",
  Shop: "reaction/shop"
};

export const encodeAccountOpaqueId = encodeOpaqueId(namespaces.Account);
export const encodeCartOpaqueId = encodeOpaqueId(namespaces.Cart);
export const encodeOrderFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.OrderFulfillmentGroup);
export const encodeOrderItemOpaqueId = encodeOpaqueId(namespaces.OrderItem);
export const encodeOrderOpaqueId = encodeOpaqueId(namespaces.Order);
export const encodePaymentOpaqueId = encodeOpaqueId(namespaces.Payment);
export const encodeProductOpaqueId = encodeOpaqueId(namespaces.Product);
export const encodeRefundOpaqueId = encodeOpaqueId(namespaces.Refund);
export const encodeShopOpaqueId = encodeOpaqueId(namespaces.Shop);

export const decodeAccountOpaqueId = decodeOpaqueIdForNamespace(namespaces.Account);
export const decodeCartOpaqueId = decodeOpaqueIdForNamespace(namespaces.Cart);
export const decodeFulfillmentMethodOpaqueId = decodeOpaqueIdForNamespace(namespaces.FulfillmentMethod);
export const decodeOrderFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderFulfillmentGroup);
export const decodeOrderItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderItem);
export const decodeOrderOpaqueId = decodeOpaqueIdForNamespace(namespaces.Order);
export const decodePaymentOpaqueId = decodeOpaqueIdForNamespace(namespaces.Payment);
export const decodeProductOpaqueId = decodeOpaqueIdForNamespace(namespaces.Product);
export const decodeRefundOpaqueId = decodeOpaqueIdForNamespace(namespaces.Refund);
export const decodeShopOpaqueId = decodeOpaqueIdForNamespace(namespaces.Shop);

/**
 * @param {Object[]} items Array of OrderItemInput
 * @returns {Object[]} Same array with all IDs transformed to internal
 */
export function decodeOrderItemsOpaqueIds(items) {
  return items.map((item) => ({
    ...item,
    productConfiguration: {
      productId: decodeProductOpaqueId(item.productConfiguration.productId),
      productVariantId: decodeProductOpaqueId(item.productConfiguration.productVariantId)
    }
  }));
}
