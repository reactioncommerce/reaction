import calculateDiscountAmount from "./calculateDiscountAmount.js";
import formatMoney from "./formatMoney.js";

/**
 * @summary Recalculate the item subtotal
 * @param {Object} context - The application context
 * @param {Object} item - The cart item
 * @returns {void} undefined
 */
export default function recalculateCartItemSubtotal(context, item) {
  let totalDiscount = 0;
  const undiscountedAmount = formatMoney(item.price.amount * item.quantity);
  item.subtotal.amount = undiscountedAmount;

  item.discounts.forEach((discount) => {
    const { discountedAmount, discountCalculationType, discountValue, discountType, discountMaxValue, discountMaxUnits } = discount;
    const calculationMethod = context.discountCalculationMethods[discountCalculationType];

    // eslint-disable-next-line require-jsdoc
    function getItemDiscountedAmount() {
      if (typeof discountMaxUnits === "number" && discountMaxUnits > 0 && discountMaxUnits < item.quantity) {
        const pricePerUnit = item.subtotal.amount / item.quantity;
        const amountCanBeDiscounted = pricePerUnit * discountMaxUnits;
        const maxUnitsDiscountedAmount = calculateDiscountAmount(context, amountCanBeDiscounted, discount);
        return formatMoney(maxUnitsDiscountedAmount + (item.subtotal.amount - amountCanBeDiscounted));
      }
      return formatMoney(calculationMethod(discountValue, item.subtotal.amount));
    }

    const itemDiscountedAmount = getItemDiscountedAmount();

    // eslint-disable-next-line require-jsdoc
    function getDiscountAmount() {
      if (discountType === "order") return discountedAmount;

      const discountAmount = formatMoney(item.subtotal.amount - itemDiscountedAmount);
      if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
        return Math.min(discountAmount, discountMaxValue);
      }
      return discountAmount;
    }

    const discountAmount = getDiscountAmount();

    totalDiscount += discountAmount;
    discount.discountedAmount = discountAmount;
    item.subtotal.amount = formatMoney(undiscountedAmount - totalDiscount);
  });

  item.subtotal.discount = totalDiscount;
  item.subtotal.undiscountedAmount = undiscountedAmount;
}
