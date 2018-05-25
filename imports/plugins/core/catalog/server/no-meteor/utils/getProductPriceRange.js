import getPriceRange from "./getPriceRange";
import getVariants from "./getVariants";
import getVariantPriceRange from "./getVariantPriceRange";

/**
 *
 * @method getProductPriceRange
 * @summary Get the PriceRange object for a Product by ID
 * @param {String} productId - A product ID
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<Object>} Product PriceRange object
 */
export default async function getProductPriceRange(productId, collections) {
  const { Products } = collections;
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new Error("Product not found");
  }

  const variants = await getVariants(product._id, collections, true);
  const visibleVariants = variants.filter((option) => option.isVisible && !option.isDeleted);
  if (visibleVariants.length > 0) {
    const variantPrices = [];
    await Promise.all(visibleVariants.map(async (variant) => {
      const { min, max } = await getVariantPriceRange(variant._id, collections);
      variantPrices.push(min, max);
    }));
    return getPriceRange(variantPrices);
  }

  return getPriceRange([0]);
}
