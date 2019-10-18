import { xformCartCheckout } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Cart/checkout
 * @method
 * @memberof Accounts/GraphQL
 * @summary converts the props on the provided cart to an object matching the Checkout GraphQL schema
 * @param {Object} cart - result of the parent resolver, which is a Cart object in GraphQL schema format
 * @param {ConnectionArgs} connectionArgs - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} A connection object
 */
export default async function checkout(cart, connectionArgs, context) {
  return xformCartCheckout(context.collections, cart);
}
