/**
 * @summary Get the total discount amount for a single item
 * @param {Number} context - The application context
 * @param {Number} cart - The cart to calculate the discount for
 * @returns {Number} The total discount amount
 */
export default function getItemDiscountTotal(context, cart) {
  let totalItemDiscount = 0;
  for (const item of cart.items) {
    const originalPrice = item.quantity * item.price.amount;
    const actualPrice = item.subtotal.amount;
    totalItemDiscount += (originalPrice - actualPrice);
  }
  return totalItemDiscount;
}
