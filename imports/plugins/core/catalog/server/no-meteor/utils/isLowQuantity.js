import getProductQuantity from "./getProductQuantity";

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
    const quantity = getProductQuantity(variant, variants);
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= threshold;
    }
    return false;
  });
  return results.some((result) => result);
}
