import formatMoney from "./formatMoney.js";

/**
 * @summary Recalculate shipping discount
 * @param {Object} context - The application context
 * @param {Object} shipping - The shipping record
 * @returns {Promise<void>} undefined
 */
export default function recalculateShippingDiscount(context, shipping) {
  let totalDiscount = 0;
  const { shipmentMethod } = shipping;
  if (!shipmentMethod) return;

  const undiscountedAmount = formatMoney(shipmentMethod.shippingPrice);

  shipping.discounts.forEach((discount) => {
    const { discountCalculationType, discountValue, discountMaxValue } = discount;
    const calculationMethod = context.discountCalculationMethods[discountCalculationType];

    const shippingDiscountAmount = formatMoney(calculationMethod(discountValue, undiscountedAmount));

    // eslint-disable-next-line require-jsdoc
    function getDiscountAmount() {
      const discountAmount = formatMoney(undiscountedAmount - shippingDiscountAmount);
      if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
        return Math.min(discountAmount, discountMaxValue);
      }
      return discountAmount;
    }

    const discountAmount = getDiscountAmount();

    totalDiscount += discountAmount;
    discount.discountedAmount = discountAmount;
  });

  shipmentMethod.discount = totalDiscount;
  shipmentMethod.shippingPrice = undiscountedAmount - totalDiscount;
  shipmentMethod.undiscountedRate = undiscountedAmount;
}
