/**
 * @method isLowQuantity
 * @summary If at least one of the product variants quantity is less than the low inventory threshold return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array of child variants
 * @return {boolean} low quantity or not
 */
export default function isLowQuantity(variants) {
  const threshold = variants && variants.length && variants[0].lowInventoryWarningThreshold;
  const results = variants.map((variant) => {
    if (variant.inventoryManagement && variant.inventoryAvailableToSell) {
      return variant.inventoryAvailableToSell <= threshold;
    }
    return false;
  });
  return results.some((result) => result);
}
