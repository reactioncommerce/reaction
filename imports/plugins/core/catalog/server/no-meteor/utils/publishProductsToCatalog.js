import publishProductToCatalogById from "./publishProductToCatalogById";

/**
 * @method publishProductsToCatalog
 * @summary Publish one or more products to the Catalog
 * @memberof Catalog
 * @param {Array} productIds - An array of product IDs. Must be top-level products.
 * @param {Object} collections - Raw mongo collections
 * @return {boolean} true on successful publish for all documents, false if one ore more fail to publish
 */
export default async function publishProductsToCatalog(productIds, collections) {
  const promises = productIds.map((product) => publishProductToCatalogById(product, collections));
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
