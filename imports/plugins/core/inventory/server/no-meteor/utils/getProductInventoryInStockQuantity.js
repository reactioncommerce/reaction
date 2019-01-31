import getVariants from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariants";

/**
 *
 * @method getProductInventoryInStockQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryInStock`.
 * This function can take only a top product ID and a mongo collection as params to return the product
 * `inventoryInStock` quantity, which is a calculation of the sum of all variant `inventoryInStock` quantities.
 * @param {Object} productId - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @return {Promise<number>} Variant quantity.
 */
export default async function getProductInventoryInStockQuantity(productId, collections) {
  const variants = await getVariants(productId, collections, true);

  if (variants && variants.length) {
    return variants.reduce((sum, variant) => sum + variant.inventoryInStock || 0, 0);
  }
  return 0;
}
