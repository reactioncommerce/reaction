import ProductRevision from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";

/**
 * @method isSoldOut
 * @summary We are to stop accepting new orders if product is marked as `isSoldOut`.
 * @memberof Catalog
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
export default async function isSoldOut(variants) {
  const promises = variants.map(async variant => {
    if (variant.inventoryManagement) {
      return ProductRevision.getVariantQuantity(variant) <= 0;
    }
    return false;
  });
  const results = Promise.all(promises);
  return results.every(result => result);
}
