import getVariants from "./getVariants";
import getVariantPriceRange from "./getVariantPriceRange";
import getPriceRange from "./getPriceRange";

/**
 *
 * @method getProductPriceRange
 * @summary TODO:
 * @param {String} productId - TODO:
 * @param {Object} collections - TODO:
 * @return {Promise<Object>} TODO:
 */
export default async function getProductPriceRange(productId, collections) {
  const { Products } = collections;
  const product = await Products.findOne({ _id: productId });
  if (!product) {
    throw new Error("Product not found");
  }

  const variants = await getVariants(product._id, collections, true);
  const visableVariants = variants.filter((option) => option.isVisible && !option.isDeleted);
  if (visableVariants.length > 0) {
    const variantPrices = [];
    await Promise.all(
      visableVariants.map(async (variant) => {
        const { min, max } = await getVariantPriceRange(variant._id, collections);
        variantPrices.push(min, max);
      })
    );
    return getPriceRange(variantPrices);
  }

  return getPriceRange([0]);
}
