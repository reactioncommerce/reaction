import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";
import { xformCartItems } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name "Cart.items"
 * @method
 * @memberof Cart/GraphQL
 * @summary converts the `items` prop on the provided cart to a connection
 * @param {Object} cart - result of the parent resolver, which is a Cart object in GraphQL schema format
 * @return {Promise<Object>} A connection object
 */
export default async function items(cart, connectionArgs, context) {
  if (!Array.isArray(cart.items)) return null;

  return xformArrayToConnection(connectionArgs, xformCartItems(context, cart.items));
}
