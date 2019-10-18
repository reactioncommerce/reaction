import getDisplayPrice from "./getDisplayPrice.js";

/**
 *
 * @method getPriceRange
 * @summary Get Price object from array of Product prices
 * @param {Array} prices - Array of Product price properties
 * @param {Object} [currencyInfo] - A currency object in Reaction schema
 * @returns {Promise<Object>} PriceRange object
 */
export default function getPriceRange(prices, currencyInfo) {
  if (prices.length === 1) {
    const price = prices[0];
    return {
      range: getDisplayPrice(price, price, currencyInfo),
      min: price,
      max: price
    };
  }

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  prices.forEach((price) => {
    if (price < priceMin) {
      priceMin = price;
    }
    if (price > priceMax) {
      priceMax = price;
    }
  });

  return {
    range: getDisplayPrice(priceMin, priceMax, currencyInfo),
    min: priceMin,
    max: priceMax
  };
}
