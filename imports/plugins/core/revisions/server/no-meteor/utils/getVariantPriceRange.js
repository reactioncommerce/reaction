import getProduct from "./getProduct";
import getVariants from "./getVariants";
import getPriceRange from "./getPriceRange";

/**
 *
 * @method getVariantPriceRange
 * @summary TODO:
 * @param {string} variantId - TODO:
 * @param {Object} collections - TODO:
 * @return {Promise<Object>} TODO:
 */
export default async function getVariantPriceRange(variantId, collections) {
  const options = await getVariants(variantId, collections);
  const visibleOptions = options.filter((option) => option.isVisible && !option.isDeleted);

  if (visibleOptions.length === 0) {
    const topVariant = await getProduct(variantId, collections);
    // topVariant could be undefined when we removing last top variant
    return topVariant && getPriceRange([topVariant.price]);
  }

  const prices = visibleOptions.map((option) => option.price);
  const price = getPriceRange(prices);
  return price;
}
