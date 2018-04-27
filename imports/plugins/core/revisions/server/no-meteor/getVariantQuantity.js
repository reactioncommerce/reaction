import getVariants from "./getVariants";

/**
 * TODO
 * @method
 * @summary
 * @param
 * @param
 * @return
 */
export default async function getVariantQuantity(variant, collections, variants) {
  let options;
  if (variants) {
    options = variants.filter((option) => option.ancestors[1] === variant._id);
  } else {
    options = await getVariants(variant._id, null, collections);
  }

  if (options && options.length) {
    return options.reduce((sum, option) => sum + option.inventoryQuantity || 0, 0);
  }
  return variant.inventoryQuantity || 0;
}
