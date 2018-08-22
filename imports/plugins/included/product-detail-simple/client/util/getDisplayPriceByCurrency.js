import { formatPriceString } from "/client/api";

/**
 *
 * @method getDisplayPriceByCurrency
 * @summary Gets the display price per given pricing array from a product, variant, or option
 * @param {Array} pricingArr - An array of pricing info
 * @param {Array} currencyCode - Selected currency of customer
 * @return {String} - Display price of a product, variant, or option
 */
export default function getDisplayPriceByCurrency(pricingArr, currencyCode = "USD") {
  let shopCurrencyPricing = pricingArr.find((pricing) => pricing.currency.code === currencyCode);

  // Just a workaround if shop's currency is not USD
  // Graphql query returns pricing only in the shop's currency. Will very likely change in the future
  if (!shopCurrencyPricing) {
    [shopCurrencyPricing] = pricingArr;
  }
  const { price, minPrice, maxPrice } = shopCurrencyPricing;
  if (price > 0) {
    return formatPriceString(price);
  }
  return formatPriceString(`${minPrice} - ${maxPrice}`);
}
