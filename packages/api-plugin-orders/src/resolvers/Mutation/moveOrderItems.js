import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import {
  decodeOrderFulfillmentGroupOpaqueId,
  decodeOrderItemOpaqueId,
  decodeOrderOpaqueId
} from "../../xforms/id.js";

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
    fromFulfillmentGroupId: isOpaqueId(fromFulfillmentGroupId) ? decodeOrderFulfillmentGroupOpaqueId(fromFulfillmentGroupId) : fromFulfillmentGroupId,
    itemIds: itemIds.map((itemId) => (isOpaqueId(itemId) ? decodeOrderItemOpaqueId(itemId) : itemId)),
    orderId: isOpaqueId(orderId) ? decodeOrderOpaqueId(orderId) : orderId,
    toFulfillmentGroupId: isOpaqueId(toFulfillmentGroupId) ? decodeOrderFulfillmentGroupOpaqueId(toFulfillmentGroupId) : toFulfillmentGroupId
  });

  return {
    clientMutationId,
    order
  };
}
