/**
 *
 */
export default function getMinPriceSortByFieldPath(context, { connectionArgs }) {
  const { sortByPriceCurrencyCode } = connectionArgs || {};

  if (typeof sortByPriceCurrencyCode !== "string") {
    throw new Error("sortByPriceCurrencyCode is required when sorting by minPrice");
  }

  return `product.pricing.${sortByPriceCurrencyCode}.minPrice`;
}
