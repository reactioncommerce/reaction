import { namespaces } from "@reactioncommerce/reaction-graphql-utils";
import { assocInternalId, assocOpaqueId, decodeOpaqueIdForNamespace, encodeOpaqueId } from "./id";

export const assocOrderInternalId = assocInternalId(namespaces.Order);
export const assocOrderOpaqueId = assocOpaqueId(namespaces.Order);
export const decodeOrderOpaqueId = decodeOpaqueIdForNamespace(namespaces.Order);
export const encodeOrderOpaqueId = encodeOpaqueId(namespaces.Order);

export const assocOrderFulfillmentGroupInternalId = assocInternalId(namespaces.OrderFulfillmentGroup);
export const assocOrderFulfillmentGroupOpaqueId = assocOpaqueId(namespaces.OrderFulfillmentGroup);
export const decodeOrderFulfillmentGroupOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderFulfillmentGroup);
export const encodeOrderFulfillmentGroupOpaqueId = encodeOpaqueId(namespaces.OrderFulfillmentGroup);

export const assocOrderItemInternalId = assocInternalId(namespaces.OrderItem);
export const assocOrderItemOpaqueId = assocOpaqueId(namespaces.OrderItem);
export const decodeOrderItemOpaqueId = decodeOpaqueIdForNamespace(namespaces.OrderItem);
export const encodeOrderItemOpaqueId = encodeOpaqueId(namespaces.OrderItem);

/**
 * @summary Transform a single fulfillment group payment
 * @param {Object} payment A payment object
 * @returns {Object} Transformed payment
 */
export function xformOrderFulfillmentGroupPayment(payment) {
  const { _id, address, amount, cardBrand, createdAt, currencyCode, data, displayName, name: methodName } = payment;

  return {
    _id,
    amount: {
      amount,
      currencyCode
    },
    billingAddress: address,
    cardBrand,
    createdAt,
    currencyCode,
    data,
    displayName,
    method: {
      name: methodName
    }
  };
}
