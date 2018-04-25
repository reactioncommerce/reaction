import Logger from "@reactioncommerce/logger";

import publishProductToCatalog from "./publishProductToCatalog";

/**
 * @method publishProductToCatalogById
 * @summary Publish a product to the Catalog by ID
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function publishProductToCatalogById(productId, collections) {
  const { Products } = collections;
  // Find the product by id
  let product = await Products.findOne({ _id: productId });

  // Stop if a product could not be found
  if (!product) {
    Logger.info("Cannot publish product to catalog");
    return false;
  }

  // If the product has ancestors, then find the top product document
  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    product = await Products.findOne({
      _id: product.ancestors[0]
    });
  }

  const result = await publishProductToCatalog(product, collections);
  return result;
}
