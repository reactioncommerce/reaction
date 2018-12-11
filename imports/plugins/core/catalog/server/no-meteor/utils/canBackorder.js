/**
 * @method canBackorder
 * @summary If all the products variants have inventory policy disabled and inventory management enabled
 * @memberof Catalog
 * @param {Object[]} variants - Array with product variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
export default function canBackorder(variants) {
  const results = variants.map((variant) => !variant.inventoryPolicy && variant.inventoryManagement);
  return results.every((result) => result);
}
