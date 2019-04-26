import getVariants from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariants";

/**
 *
 * @method getProductInventoryAvailableToSellQuantity
 * @summary This function can take only a top product ID and a mongo collection as params to return the product
 *   `inventoryAvailableToSell` quantity, which is a calculation of the sum of all variant
 *   `inventoryAvailableToSell` quantities.
 * @param {Object} productId - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @return {Promise<number>} Variant quantity.
 */
export default async function getProductInventoryAvailableToSellQuantity(productId, collections) {
  const variants = await getVariants(productId, collections, true);

  if (variants && variants.length) {
    return variants.reduce((sum, variant) => sum + (variant.inventoryAvailableToSell || 0), 0);
  }
  return 0;
}
