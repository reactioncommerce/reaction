import getVariants from "./getVariants";

/**
 *
 * @method getProductInventoryAvailableToSellQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryAvailableToSell`.
 * This function can take only a top product ID and a mongo collection as params to return the product
 * `inventoryAvailableToSell` quantity, which is a calculation of the sum of all variant `inventoryAvailableToSell` quantities.
 * @param {Object} productId - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @return {Promise<number>} Variant quantity.
 */
export default async function getProductInventoryAvailableToSellQuantity(productId, collections) {
  const variants = await getVariants(productId, collections, true);

  if (variants && variants.length) {
    return variants.reduce((sum, variant) => sum + variant.inventoryAvailableToSell || 0, 0);
  }
  return 0;
}
