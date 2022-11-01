/**
 * @summary Get the total amount of a discount or promotion
 * @param {Object} cart - The cart to get the discount amount for
 * @param {Object} parameters - The parameters to pass to the trigger
 * @returns {Promise<number>} - The total amount of a discount or promotion
 */
export default async function totalItemCount(cart, parameters) {
  return cart.items.reduce((prev, current) => prev + current.price.amount * current.quantity, 0);
}
