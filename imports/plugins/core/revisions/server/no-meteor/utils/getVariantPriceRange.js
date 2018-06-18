import getPriceRange from "/imports/plugins/core/catalog/server/no-meteor/utils/getPriceRange";
import getProduct from "./getProduct";
import getVariants from "./getVariants";

/**
 *
 * @method getVariantPriceRange
 * @summary Create a Product PriceRange object by taking the lowest variant price and the highest variant
 * price to create the PriceRange. If only one variant use that variant's price to create the PriceRange
 * @param {string} variantId - A product variant ID.
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<Object>} Product PriceRange object
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
