/**
 * @method isBackorder
 * @summary If all the products variants have inventory policy disabled, inventory management enabled and a quantity of zero return `true`
 * @memberof Catalog
 * @param {Object[]} variants - Array with product variant objects
 * @return {boolean} is backorder currently active or not for a product
 */
export default function isBackorder(variants) {
  return variants.every((variant) => !variant.inventoryPolicy && variant.inventoryManagement && variant.inventoryAvailableToSell === 0);
}
