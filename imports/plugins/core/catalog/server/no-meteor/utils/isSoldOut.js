import getProductQuantity from "./getProductQuantity";

/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @return {Boolean} true if quantity is zero.
 */
export default function isSoldOut(variants) {
  if (Array.isArray(variants) && variants.length > 0) {
    if (variants[0].ancestors.length === 2) {
      return isProductSoldOut(variants);
    }
    if (variants[0].ancestors.length === 1) {
      return isVariantSoldOut(variants);
    }
  } else {
    return isOptionSoldOut(variants);
  }
}

function isVariantSoldOut(options) {
  const results = options.map((option) => option.inventoryManagement && getProductQuantity(option) <= 0);
  return results.every((result) => result);
}

function isOptionSoldOut(option) {
  return option.inventoryManagement && getProductQuantity(option) <= 0;
}

function isProductSoldOut(variants) {
  const results = variants.map((variant) => {
    const quantity = getProductQuantity(variant, variants);
    return variant.inventoryManagement && quantity <= 0;
  });
  return results.every((result) => result);
}
