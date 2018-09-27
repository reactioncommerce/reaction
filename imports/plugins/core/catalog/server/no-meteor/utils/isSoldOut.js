import getProductQuantity from "./getProductQuantity";

/**
 * @method isSoldOut
 * @summary If the type and all its descendant have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants/options/option
 * @return {Boolean} true if quantity is zero.
 */
export default function isSoldOut(variants) {
  if (Array.isArray(variants) && variants.length > 0 && variants[0].ancestors) {
    if (variants[0].ancestors.length === 2) {
      return isProductSoldOut(variants);
    }
    if (variants[0].ancestors.length === 1) {
      return isVariantSoldOut(variants);
    }
  }
  return isOptionSoldOut(variants);
}

/**
 * @method isVariantSoldOut
 * @summary If all the product option have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} options - Array of options
 * @return {Boolean} true if quantity is zero.
 */
function isVariantSoldOut(options) {
  const results = options.map(isOptionSoldOut);
  return results.every((result) => result);
}

/**
 * @method isOptionSoldOut
 * @summary If the option has quantity 0 return `true`.
 * @memberof Catalog
 * @param {Object} option - option
 * @return {Boolean} true if quantity is zero.
 */
function isOptionSoldOut(option) {
  return option.inventoryManagement && getProductQuantity(option) <= 0;
}

/**
 * @method isProductSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @return {Boolean} true if quantity is zero.
 */
function isProductSoldOut(variants) {
  const results = variants.map((variant) => {
    const quantity = getProductQuantity(variant, variants);
    return variant.inventoryManagement && quantity <= 0;
  });
  return results.every((result) => result);
}
