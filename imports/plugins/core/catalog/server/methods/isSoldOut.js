import ProductRevision from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";

/**
 * @method isSoldOut
 * @summary We are to stop accepting new orders if product is marked as `isSoldOut`.
 * @memberof Catalog
 * @param {Array} variants - Array with top-level variants
 * @param {Object} collections - raw collections
 * @return {Boolean} true if summary product quantity is zero.
 */
export default async function isSoldOut(variants, collections) {
  const promises = variants.map(async (variant) => {
    if (variant.inventoryManagement) {
      const isVariantSoldOut = (await ProductRevision.getVariantQuantity(variant)) <= 0;
      return isVariantSoldOut;
    }
    return false;
  });
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
