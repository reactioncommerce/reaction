import ProductRevision from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";

/**
 * @method isLowQuantity
 * @summary If at least one of the product variants quantity is less than the low inventory threshold return `true`
 * @memberof Catalog
 * @param {Array} variants - array of child variants
 * @param {Object} collections - raw collections
 * @return {boolean} low quantity or not
 */
export default async function isLowQuantity(variants, collections) {
  const promises = variants.map(async (variant) => {
    const quantity = await ProductRevision.getVariantQuantity(variant);
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= variant.lowInventoryWarningThreshold;
    }
    return false;
  });
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
