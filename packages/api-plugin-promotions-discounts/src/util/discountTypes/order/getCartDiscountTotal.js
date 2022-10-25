import accounting from "accounting-js";

/**
 * @summary Calculate the total discount amount for an order
 * @param {Object} cart - The cart to calculate the discount for
 * @returns {Number} The total discount amount
 */
function calculateMerchandiseTotal(cart) {
  const itemsTotal = cart.items.reduce((previousValue, currentValue) => previousValue + currentValue.subtotal.amount, 0);
  return itemsTotal;
}

/**
 * @summary Get the total discount amount for an order
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to calculate the discount for
 * @returns {Number} The total discount amount
 */
export default function getCartDiscountTotal(context, cart) {
  let totalDiscountAmount = 0;
  const merchandiseTotal = calculateMerchandiseTotal(cart);
  for (const { discountCalculationType, discountValue } of cart.discounts) {
    const appliedDiscount = context.discountCalculationMethods[discountCalculationType](discountValue, merchandiseTotal);
    totalDiscountAmount += appliedDiscount;
  }
  return Number(accounting.toFixed(totalDiscountAmount, 3));
}
