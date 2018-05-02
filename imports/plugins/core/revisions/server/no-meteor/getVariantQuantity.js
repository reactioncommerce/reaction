import getVariants from "./getVariants";

/**
 *
 * @method getVariantQuantity
 * @summary TODO:
 * @param {Object} variant - TODO:
 * @param {Object} collection - TODO:
 * @param {Object[]} variants - TODO:
 * @return {Promise<number>} TODO:
 */
export default async function getVariantQuantity(variant, collections, variants) {
  let options;
  if (variants) {
    options = variants.filter((option) => option.ancestors[1] === variant._id);
  } else {
    options = await getVariants(variant._id, collections);
  }

  if (options && options.length) {
    return options.reduce((sum, option) => sum + option.inventoryQuantity || 0, 0);
  }
  return variant.inventoryQuantity || 0;
}
