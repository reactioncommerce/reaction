import { Meteor } from "meteor/meteor";
import { uniqBy } from "lodash";

import publishProductToCatalog from "./publishProductToCatalog";

/**
 * @method publishProductsToCatalog
 * @summary Publish one or more products to the Catalog
 * @memberof Catalog
 * @param {Array} productIds - An array of product ids
 * @param {Object} collections - Raw mongo collections are passed to ProductRevision
 * @return {boolean} true on successful publish for all documents, false if one ore more fail to publish
 */
export default async function publishProductsToCatalog(productIds, collections) {
  const { Products } = collections;
  let products = productIds.map(async (productId) => {
    const product = await Products.findOne({ _id: productId });

    // Stop if a product could not be found
    if (!product) {
      throw new Meteor.Error("not-found", `No product found with ID ${productId}`);
    }

    if (!Array.isArray(product.ancestors) || product.ancestors.length === 0) {
      return product;
    }

    const topLevelProduct = await Products.findOne({
      _id: product.ancestors[0]
    });

    return topLevelProduct;
  });

  await products;

  // Remove duplicate top-level products. This could happen if a variant ID is included
  // as well as its parent ID.
  products = uniqBy(products, "_id");

  const promises = products.map((product) => publishProductToCatalog(product));
  const results = await Promise.all(promises);
  return results.every((result) => result);
}
