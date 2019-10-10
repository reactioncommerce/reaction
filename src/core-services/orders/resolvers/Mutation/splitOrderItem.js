import {
  decodeOrderItemOpaqueId,
  decodeOrderOpaqueId
} from "../../xforms/id.js";

/**
 * @name Mutation/splitOrderItem
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the splitOrderItem GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.itemId - The ID of the item to split
 * @param {Number} args.input.newItemQuantity - The quantity that will be transferred to a new
 *   order item on the same fulfillment group.
 * @param {String} args.input.orderId - The order ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} SplitOrderItemPayload
 */
export default async function splitOrderItem(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    newItemQuantity,
    itemId,
    orderId
  } = input;

  const { newItemId, order } = await context.mutations.splitOrderItem(context, {
    newItemQuantity,
    itemId: decodeOrderItemOpaqueId(itemId),
    orderId: decodeOrderOpaqueId(orderId)
  });

  return {
    clientMutationId,
    newItemId,
    order
  };
}
