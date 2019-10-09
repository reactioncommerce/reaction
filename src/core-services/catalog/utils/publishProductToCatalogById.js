import publishProductToCatalog from "./publishProductToCatalog.js";

/**
 * @method publishProductToCatalogById
 * @summary Publish a product to the Catalog by ID
 * @memberof Catalog
 * @param {String} productId - A product ID. Must be a top-level product.
 * @param {Object} context - The app context
 * @returns {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalogById(productId, context) {
  const { Products } = context.collections;
  const product = await Products.findOne({ _id: productId });
  return publishProductToCatalog(product, context);
}
