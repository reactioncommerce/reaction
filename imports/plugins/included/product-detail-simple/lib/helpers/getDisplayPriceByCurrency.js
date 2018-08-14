/**
 *
 * @method getDisplayPriceByCurrency
 * @summary Gets the display price per given pricing array from a product, variant, or option
 * @param {Array} pricingArr - An array of pricing info
 * @param {Array} currencyCode - Selected currency of customer
 * @return {String} - Display price of a product, variant, or option
 */
export default function getDisplayPriceByCurrency(pricingArr, currencyCode = "USD") {
  const currencyPricing = pricingArr.filter((pricing) => pricing.currency.code === currencyCode);
  return currencyPricing[0].displayPrice;
}
