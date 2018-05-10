import getVariantQuantity from "/imports/plugins/core/revisions/server/no-meteor/utils/getVariantQuantity";

/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Array} variants - Array with top-level variants
 * @param {Object} collections - Raw mongo collections
 * @return {Boolean} true if quantity is zero.
 */
export default async function isSoldOut(variants, collections) {
  const promises = variants.map(async (variant) => {
    const quantity = await getVariantQuantity(variant, collections, variants);
    return variant.inventoryManagement && quantity <= 0;
  });
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
