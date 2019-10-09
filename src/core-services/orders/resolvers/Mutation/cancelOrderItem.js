import { decodeOrderOpaqueId, decodeOrderItemOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";

/**
 * @name Mutation/cancelOrderItem
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the cancelOrderItem GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.orderId - The order ID
 * @param {String} args.input.itemId - The ID of the item to cancel
 * @param {Number} args.input.cancelQuantity - Quantity to cancel. Must be equal to or less than the item quantity.
 * @param {String} [args.input.reason] - Optional free text reason for cancel
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} CancelOrderItemPayload
 */
export default async function cancelOrderItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    cancelQuantity,
    itemId,
    orderId,
    reason
  } = input;

  const { order } = await context.mutations.cancelOrderItem(context, {
    cancelQuantity,
    itemId: decodeOrderItemOpaqueId(itemId),
    orderId: decodeOrderOpaqueId(orderId),
    reason
  });

  return {
    clientMutationId,
    order
  };
}
