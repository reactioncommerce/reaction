import { decodeCartOpaqueId, decodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Query.getCommonOrderForCartGroup
 * @method
 * @memberof Cart/GraphQL
 * @summary Get a CommonOrder object for a cart fulfillment group
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.cartId - cart ID to create CommonOrder from
 * @param {String} args.fulfillmentGroupId - fulfillment group ID to create CommonOrder from
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} A CommonOrder object
 */
export default async function getCommonOrderForCartGroup(parentResult, args, context) {
  const { cartId, fulfillmentGroupId } = args;

  return context.queries.getCommonOrderForCartGroup(context, {
    cartId: decodeCartOpaqueId(cartId),
    fulfillmentGroupId: decodeFulfillmentGroupOpaqueId(fulfillmentGroupId)
  });
}
