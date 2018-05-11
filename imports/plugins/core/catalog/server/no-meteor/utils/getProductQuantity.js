/**
 *
 * @method getProductQuantity
 * @summary Get the number of product variants still avalible to purchase. This function can
 * take only a top level variant object as a param to return the product's quantity.
 * This method can also take a top level variant and an array of product variant options as
 * params return the product's quantity.
 * @memberof Catalog
 * @param {Object} variant - A top level product variant object.
 * @param {Object[]} variants - Array of product variant option objects.
 * @return {number} Variant quantity
 */
export default function getProductQuantity(variant, variants = []) {
  const options = variants.filter((option) => option.ancestors[1] === variant._id);
  if (options && options.length) {
    return options.reduce((sum, option) => sum + option.inventoryQuantity || 0, 0);
  }
  return variant.inventoryQuantity || 0;
}
