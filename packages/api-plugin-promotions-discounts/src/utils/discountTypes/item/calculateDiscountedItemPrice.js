/**
 * @summary Calculates the discounted price for an item
 * @param {*} context - The application context
 * @param {*} params.price - The price to calculate the discount for
 * @param {*} params.quantity - The quantity of the item
 * @param {*} params.discounts - The discounts to calculate
 * @returns {Number} The discounted price
 */
export default function calculateDiscountedItemPrice(context, { price, quantity, discounts }) {
  let totalDiscount = 0;
  const amountBeforeDiscounts = price * quantity;
  discounts.forEach((discount) => {
    const calculationMethod = context.discountCalculationMethods[discount.discountCalculationType];
    const discountAmount = calculationMethod(discount.discountValue, amountBeforeDiscounts);
    totalDiscount += discountAmount;
  });
  if (totalDiscount < amountBeforeDiscounts) {
    return amountBeforeDiscounts - totalDiscount;
  }
  return 0;
}
