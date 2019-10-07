import { orderBy } from "lodash";
import xformArrayToConnection from "@reactioncommerce/api-utils/graphql/xformArrayToConnection.js";
import { xformCartItems } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @summary Sorts the provided cart items according to the connectionArgs.
 * @param {Object[]} cartItems Array of cart items
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @returns {Object[]} Sorted list of cart items
 */
function sortCartItems(cartItems, connectionArgs) {
  const { sortOrder, sortBy } = connectionArgs;

  let sortedItems;
  switch (sortBy) {
    case "addedAt":
      sortedItems = orderBy(cartItems, ["addedAt", "_id"], [sortOrder, sortOrder]);
      break;

    // sort alpha by _id
    default:
      sortedItems = orderBy(cartItems, ["_id"], [sortOrder]);
      break;
  }

  return sortedItems;
}

/**
 * @name Cart/items
 * @method
 * @memberof Cart/GraphQL
 * @summary converts the `items` prop on the provided cart to a connection
 * @param {Object} cart - result of the parent resolver, which is a Cart object in GraphQL schema format
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @param {Object} context - The per-request context object
 * @returns {Promise<Object>} A connection object
 */
export default async function items(cart, connectionArgs, context) {
  let { items: cartItems } = cart;
  if (!Array.isArray(cartItems) || cartItems.length === 0) return xformArrayToConnection(connectionArgs, []);

  // Apply requested sorting
  cartItems = sortCartItems(cartItems, connectionArgs);

  return xformArrayToConnection(connectionArgs, xformCartItems(context, cartItems));
}
