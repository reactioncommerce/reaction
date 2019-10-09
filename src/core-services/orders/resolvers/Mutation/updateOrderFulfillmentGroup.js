import { decodeOrderOpaqueId, decodeOrderFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";

/**
 * @name Mutation/updateOrderFulfillmentGroup
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the updateOrderFulfillmentGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.orderFulfillmentGroupId - The order fulfillment group ID
 * @param {String} args.input.orderId - The order ID
 * @param {String} [args.input.status] - Set this as the current order fulfillment group status
 * @param {String} [args.input.tracking] - Set this as the current order fulfillment group shipment tracking reference
 * @param {String} [args.input.trackingUrl] - Set this as the current order fulfillment group shipment tracking URL
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} UpdateOrderFulfillmentGroupPayload
 */
export default async function updateOrderFulfillmentGroup(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    orderId,
    orderFulfillmentGroupId,
    status,
    tracking,
    trackingUrl
  } = input;

  const { order } = await context.mutations.updateOrderFulfillmentGroup(context, {
    orderId: decodeOrderOpaqueId(orderId),
    orderFulfillmentGroupId: decodeOrderFulfillmentGroupOpaqueId(orderFulfillmentGroupId),
    status,
    tracking,
    trackingUrl
  });

  return {
    clientMutationId,
    order
  };
}
