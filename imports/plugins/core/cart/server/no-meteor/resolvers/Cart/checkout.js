import { xformCartCheckout } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name "Cart.checkout"
 * @method
 * @memberof Accounts/GraphQL
 * @summary converts the props on the provided cart to an object matching the Checkout GraphQL schema
 * @param {Object} cart - result of the parent resolver, which is a Cart object in GraphQL schema format
 * @return {Promise<Object>} A connection object
 */
export default async function checkout(cart, connectionArgs, context) {
  return xformCartCheckout(context.collections, cart);
}
