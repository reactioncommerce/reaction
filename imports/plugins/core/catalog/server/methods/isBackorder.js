/**
 * @method isBackorder
 * @summary If all the products variants have inventory policy disabled, inventory management enabled and a quantity of zero return `true`
 * @memberof Catalog
 * @param {Array} variants - Array with product variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
export default async function isBackorder(variants) {
  return variants.every((variant) => !variant.inventoryPolicy && variant.inventoryManagement && variant.inventoryQuantity === 0);
}
