import accounting from "accounting-js";

/**
 * @summary Recalculate the item subtotal
 * @param {Object} context - The application context
 * @param {Object} item - The cart item
 * @returns {void} undefined
 */
export default function recalculateCartItemSubtotal(context, item) {
  let totalDiscount = 0;
  const undiscountedAmount = item.price.amount * item.quantity;

  item.discounts.forEach((discount) => {
    const { discountedAmount, discountCalculationType, discountValue, discountType } = discount;
    const calculationMethod = context.discountCalculationMethods[discountCalculationType];
    const discountAmount =
      discountType === "order"
        ? discountedAmount
        : Number(accounting.toFixed(calculationMethod(discountValue, undiscountedAmount), 3));

    totalDiscount += discountAmount;
    discount.discountedAmount = discountAmount;
  });
  item.subtotal.amount = Number(accounting.toFixed(undiscountedAmount - totalDiscount, 3));
  item.subtotal.discount = totalDiscount;
  item.subtotal.undiscountedAmount = undiscountedAmount;
}
