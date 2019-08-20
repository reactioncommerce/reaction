/**
 * @method getVariantPrice
 * @summary This method returns the applicable price and currency code for a selected product.
 * @param {Object} context - App context
 * @param {Object} catalogVariant - A selected product variant.
 * @param {String} currencyCode - The currency code in which to get price
 * @returns {Object} - A cart item price value.
 */
export default function getVariantPrice(context, catalogVariant, currencyCode) {
  if (!currencyCode) throw new Error("getVariantPrice received no currency code");
  if (!catalogVariant) throw new Error("getVariantPrice received no catalogVariant");
  if (!catalogVariant.pricing) throw new Error(`Catalog variant ${catalogVariant._id} has no pricing information saved`);

  return catalogVariant.pricing[currencyCode] || {};
}
