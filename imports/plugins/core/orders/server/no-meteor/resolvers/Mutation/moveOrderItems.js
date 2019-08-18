import {
  decodeOrderFulfillmentGroupOpaqueId,
  decodeOrderItemOpaqueId,
  decodeOrderOpaqueId
} from "@reactioncommerce/reaction-graphql-xforms/order";

/**
 * @name Mutation/moveOrderItems
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the moveOrderItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.fromFulfillmentGroupId - The ID of the order fulfillment group from which all the items
 *   are to be moved.
 * @param {String[]} args.input.itemIds - The list of item IDs to move. The full quantity must be moved.
 * @param {String} args.input.orderId - The order ID
 * @param {String} args.input.toFulfillmentGroupId - The ID of the order fulfillment group to which all the items
 *   are to be moved.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} MoveOrderItemsPayload
 */
export default async function moveOrderItems(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    fromFulfillmentGroupId,
    itemIds,
    orderId,
    toFulfillmentGroupId
  } = input;

  const { order } = await context.mutations.moveOrderItems(context, {
    fromFulfillmentGroupId: decodeOrderFulfillmentGroupOpaqueId(fromFulfillmentGroupId),
    itemIds: itemIds.map(decodeOrderItemOpaqueId),
    orderId: decodeOrderOpaqueId(orderId),
    toFulfillmentGroupId: decodeOrderFulfillmentGroupOpaqueId(toFulfillmentGroupId)
  });

  return {
    clientMutationId,
    order
  };
}
