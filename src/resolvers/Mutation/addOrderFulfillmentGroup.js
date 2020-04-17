import {
  decodeFulfillmentMethodOpaqueId,
  decodeOrderItemOpaqueId,
  decodeOrderItemsOpaqueIds,
  decodeOrderOpaqueId,
  decodeShopOpaqueId
} from "../../xforms/id.js";

/**
 * @name Mutation/addOrderFulfillmentGroup
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the addOrderFulfillmentGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.fulfillmentGroup The order fulfillment group input, used to build the new group
 * @param {String[]} [args.input.moveItemIds] Optional list of order item IDs that should be moved from an
 *   existing group to the new group.
 * @param {String} args.input.orderId Order ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddOrderFulfillmentGroupPayload
 */
export default async function addOrderFulfillmentGroup(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    fulfillmentGroup,
    moveItemIds,
    orderId
  } = input;

  const { newFulfillmentGroupId, order } = await context.mutations.addOrderFulfillmentGroup(context, {
    fulfillmentGroup: {
      ...fulfillmentGroup,
      items: fulfillmentGroup.items ? decodeOrderItemsOpaqueIds(fulfillmentGroup.items) : null,
      selectedFulfillmentMethodId: decodeFulfillmentMethodOpaqueId(fulfillmentGroup.selectedFulfillmentMethodId),
      shopId: decodeShopOpaqueId(fulfillmentGroup.shopId)
    },
    moveItemIds: moveItemIds && moveItemIds.map(decodeOrderItemOpaqueId),
    orderId: decodeOrderOpaqueId(orderId)
  });

  return {
    clientMutationId,
    newFulfillmentGroupId,
    order
  };
}
