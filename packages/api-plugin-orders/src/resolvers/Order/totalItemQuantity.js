/**
 * @name Order/totalItemQuantity
 * @method
 * @memberof Order/GraphQL
 * @summary Calculates the total quantity of items in the order and returns a number
 * @param {Object} order - Result of the parent resolver, which is a Order object in GraphQL schema format
 * @param {Object} connectionArgs - Connection args. (not used for this resolver)
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Number>} A promise that resolves to the number of the total item quantity
 */
export default async function totalItemQuantity(order) {
  if (!Array.isArray(order.shipping)) return 0;

  return order.shipping.reduce((sum, group) => sum + group.totalItemQuantity, 0);
}
