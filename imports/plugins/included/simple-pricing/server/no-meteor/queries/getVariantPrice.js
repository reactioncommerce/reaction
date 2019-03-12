/**
 * @method getVariantPrice
 * @summary This method returns the applicable price and currency code for a selected product.
 * @param {Object} context - App context
 * @param {Object} catalogVariant - A selected product variant.
 * @param {Object} currencyCode - The currency code in which to get price
 * @return {Object} - A cart item price value.
 */
export default function getVariantPrice(context, catalogVariant, currencyCode) {
  return catalogVariant.pricing[currencyCode];
}
