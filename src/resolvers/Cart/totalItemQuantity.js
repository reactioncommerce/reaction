/**
 * @param {Object} collections Map of Mongo collections
 * @param {Object} items Cart items
 * @returns {Number} Total quantity of all items in the cart
 */
async function xformTotalItemQuantity(collections, items) {
  // Total item quantity comes from the sum of the quantities of each item
  return (items || []).reduce((sum, item) => (sum + item.quantity), 0);
}

/**
 * @name Cart/totalItemQuantity
 * @method
 * @memberof Cart/GraphQL
 * @summary Calculates the total quantity of items in the cart and returns a number
 * @param {Object} cart - Result of the parent resolver, which is a Cart object in GraphQL schema format
 * @param {Object} connectionArgs - Connection args. (not used for this resolver)
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Number>} A promise that resolves to the number of the total item quantity
 */
export default async function totalItemQuantity(cart, connectionArgs, context) {
  if (!Array.isArray(cart.items)) return 0;

  return xformTotalItemQuantity(context.collections, cart.items);
}
