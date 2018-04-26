import ProductRevision from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";
/**
 * @method isBackorder
 * @summary If all the products variants have inventory policy disabled, inventory management enabled and a quantity of zero return `true`
 * @memberof Catalog
 * @param {Array} variants - Array with product variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
export default async function isBackorder(variants, collections) {
  const promises = variants.map(async (variant) => {
    const quantity = await ProductRevision.getVariantQuantity(variant, collections, variants);
    return !variant.inventoryPolicy && variant.inventoryManagement && quantity === 0;
  });
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
