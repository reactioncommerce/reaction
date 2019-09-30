import { decodeCartOpaqueId, decodeFulfillmentGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Query.getCommonOrderForCartGroup
 * @method
 * @memberof Cart/GraphQL
 * @summary Get a CommonOrder object for a cart fulfillment group
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.cartId - ID of the cart
 * @param {String} args.fulfillmentGroupId - ID of the fulfillment group
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
