import accounting from "accounting-js";

/**
 * @summary calculate the merchandise total for a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart
 * @returns {Object} - The cart with the merchandise total added
 */
export default function merchandiseTotal(context, cart) {
  const merchTotal = cart.items.reduce((prev, current) => prev + current.price.amount * current.quantity, 0);
  cart.merchandiseTotal = Number(accounting.toFixed(merchTotal, 2));
  return cart;
}
