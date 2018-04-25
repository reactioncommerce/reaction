import ProductRevision from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";

/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Array} variants - Array with top-level variants
 * @param {Object} collections - Raw mongo collections are passed to ProductRevision
 * @return {Boolean} true if quantity is zero.
 */
export default async function isSoldOut(variants, collections) {
  const promises = variants.map(async (variant) => {
    if (variant.inventoryManagement) {
      const isVariantSoldOut = (await ProductRevision.getVariantQuantity(variant, collections)) <= 0;
      return isVariantSoldOut;
    }
    return false;
  });
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
