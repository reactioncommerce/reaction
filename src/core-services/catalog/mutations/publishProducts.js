/* eslint-disable no-undef */
import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import publishProductsToCatalog from "../utils/publishProductsToCatalog.js";

/**
 *
 * @method publishProducts
 * @summary Publish an array of products to the Catalog collection by Product ID
 * @param {Object} context -  an object containing the per-request state
 * @param {Array} productIds - An array of product IDs
 * @returns {Promise<Object[]>} Array of CatalogItemProduct objects
 */
export default async function publishProducts(context, productIds) {
  const { collections, isInternalCall } = context;
  const { Catalog, Products } = collections;

  // Find all products
  const products = await Products.find(
    {
      _id: { $in: productIds }
    },
    { _id: 1, shopId: 1 }
  ).toArray();

  if (products.length !== productIds.length) {
    throw new ReactionError("not-found", "Some products not found");
  }

  if (!isInternalCall) {
    const uniqueShopIds = _.uniq(products.map((product) => product.shopId));
    for (const shopId of uniqueShopIds) {
      for (const product of products) {
        // TODO(pod-auth): figure out a better way to loop through this
        await context.validatePermissionsLegacy(["createProduct", "product/admin", "product/publish"], null, { shopId }); // eslint-disable-line no-await-in-loop
        await context.validatePermissions(`reaction:products:${product._id}`, "publish", { shopId }); // eslint-disable-line no-await-in-loop
      }
    }
  }

  const success = await publishProductsToCatalog(productIds, context);
  if (!success) {
    Logger.error("Some Products could not be published to the Catalog.");
    throw new ReactionError(
      "server-error",
      "Some Products could not be published to the Catalog. Make sure the parent product and its variants and options are visible."
    );
  }
  return Catalog.find({ "product.productId": { $in: productIds } }).toArray();
}
