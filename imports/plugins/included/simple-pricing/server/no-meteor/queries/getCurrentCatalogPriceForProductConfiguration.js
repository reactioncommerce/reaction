import findProductAndVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/findProductAndVariant";

/**
 * @summary Returns the current price in the Catalog for the given product configuration
 * @param {Object} productConfiguration The ProductConfiguration object
 * @param {String} currencyCode The currency code
 * @param {Object} collections Map of MongoDB collections
 * @returns {Object} Object with `price` as the current price in the Catalog for the given product configuration.
 *   Also returns catalogProduct and catalogProductVariant docs in case you need them.
 */
export default async function getCurrentCatalogPriceForProductConfiguration(productConfiguration, currencyCode, collections) {
  const { productId, productVariantId } = productConfiguration;
  const {
    catalogProduct,
    variant: catalogProductVariant
  } = await findProductAndVariant(collections, productId, productVariantId);

  const variantPriceInfo = (catalogProductVariant.pricing && catalogProductVariant.pricing[currencyCode]) || {};
  const price = variantPriceInfo.price || catalogProductVariant.price;

  return {
    catalogProduct,
    catalogProductVariant,
    price
  };
}
