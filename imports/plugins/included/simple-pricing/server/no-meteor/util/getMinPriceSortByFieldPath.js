/**
 * @param {Object} context - an object containing the per-request state
 * @param {Object} connectionArgs - an object of all arguments that were sent by the client
 * @param {String} connectionArgs.sortPriceByCurrencyCode - currency code
 * @returns {Number} minimum price
 */
export default function getMinPriceSortByFieldPath(context, { connectionArgs }) {
  const { sortByPriceCurrencyCode } = connectionArgs || {};

  if (typeof sortByPriceCurrencyCode !== "string") {
    throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
  }

  return `product.pricing.${sortByPriceCurrencyCode}.minPrice`;
}
