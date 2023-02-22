import calculateDiscountAmount from "./calculateDiscountAmount.js";
import formatMoney from "./formatMoney.js";

/**
 * @summary Recalculate shipping discount
 * @param {Object} context - The application context
 * @param {Object} quote - The quote record
 * @returns {Promise<void>} undefined
 */
export default function recalculateQuoteDiscount(context, quote) {
  let totalDiscount = 0;
  const { method, undiscountedRate } = quote;

  const rate = undiscountedRate || method.rate;
  quote.undiscountedRate = rate;

  quote.discounts.forEach((discount) => {
    const quoteRate = quote.rate;
    const { discountMaxValue } = discount;

    const discountedRate = calculateDiscountAmount(context, quoteRate, discount);

    // eslint-disable-next-line require-jsdoc
    function getDiscountedRate() {
      const discountRate = formatMoney(quoteRate - discountedRate);
      if (typeof discountMaxValue === "number" && discountMaxValue > 0) {
        return Math.min(discountRate, discountMaxValue);
      }
      return discountRate;
    }

    const discountRate = getDiscountedRate();

    totalDiscount += discountRate;
    discount.discountedAmount = discountedRate;
    quote.rate = discountedRate;
  });

  quote.discount = totalDiscount;
  quote.shippingPrice = quote.rate + quote.handlingPrice;
}
