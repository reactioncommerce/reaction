import accounting from "accounting-js";

/**
 * @summary Calculate the total discount amount for an order
 * @param {Object} cart - The cart to calculate the discount for
 * @returns {Number} The total discount amount
 */
function calculateMerchandiseTotal(cart) {
  const itemsTotal = cart.items.reduce(
    (previousValue, currentValue) => previousValue + currentValue.price.amount * currentValue.quantity,
    0
  );
  return itemsTotal;
}

/**
 * @summary Get the discount amount for a discount item
 * @param {Object} context - The application context
 * @param {Object} cart - The cart to calculate the discount for
 * @param {Object} discount - The discount to calculate the discount amount for
 * @returns {Number} - The discount amount
 */
export default function getCartDiscountAmount(context, cart, discount) {
  const merchandiseTotal = calculateMerchandiseTotal(cart);
  const { discountCalculationType, discountValue } = discount;
  const appliedDiscount = context.discountCalculationMethods[discountCalculationType](discountValue, merchandiseTotal);
  return Number(accounting.toFixed(appliedDiscount, 3));
}
