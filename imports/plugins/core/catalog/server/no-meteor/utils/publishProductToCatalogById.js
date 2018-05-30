import publishProductToCatalog from "./publishProductToCatalog";

/**
 * @method publishProductToCatalogById
 * @summary Publish a product to the Catalog by ID
 * @memberof Catalog
 * @param {string} productId - A product ID. Must be a top-level product.
 * @param {Object} collections - Raw mongo collections
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalogById(productId, collections) {
  const { Products } = collections;
  const product = await Products.findOne({ _id: productId });
  return publishProductToCatalog(product, collections);
}
