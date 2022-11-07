import formatMoney from "./formatMoney.js";

/**
 * @summary Recalculate the item subtotal
 * @param {Object} context - The application context
 * @param {Object} item - The cart item
 * @returns {void} undefined
 */
export default function recalculateCartItemSubtotal(context, item) {
  let totalDiscount = 0;
  const undiscountedAmount = Number(formatMoney(item.price.amount * item.quantity));
  item.subtotal.amount = undiscountedAmount;

  item.discounts.forEach((discount) => {
    const { discountedAmount, discountCalculationType, discountValue, discountType } = discount;
    const calculationMethod = context.discountCalculationMethods[discountCalculationType];
    const itemDiscountedAmount = calculationMethod(discountValue, item.subtotal.amount);
    const discountAmount = discountType === "order" ? discountedAmount : Number(formatMoney(item.subtotal.amount - itemDiscountedAmount));

    totalDiscount += discountAmount;
    discount.discountedAmount = discountAmount;
    item.subtotal.amount = Number(formatMoney(undiscountedAmount - totalDiscount));
  });
  item.subtotal.discount = totalDiscount;
  item.subtotal.undiscountedAmount = undiscountedAmount;
}
