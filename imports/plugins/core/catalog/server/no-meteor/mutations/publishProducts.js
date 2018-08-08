import { uniq } from "lodash";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import publishProductsToCatalog from "../utils/publishProductsToCatalog";

/**
 *
 * @method publishProducts
 * @summary Publish an array of products to the Catalog collection by Product ID
 * @param {Object} context -  an object containing the per-request state
 * @param {Array} productIds - An array of product IDs
 * @return {Promise<Object[]>} Array of CatalogItemProduct objects
 */
export default async function publishProducts(context, productIds) {
  const { collections, shopId: primaryShopId, userHasPermission } = context;
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

  // Only allow users to publish products for shops they permissions to createProductsFor
  // If the user can createProducts on the main shop, they can publish products for all shops to the catalog.
  const canUpdatePrimaryShopProducts = userHasPermission(["createProduct"], primaryShopId);
  if (!canUpdatePrimaryShopProducts) {
    const uniqueShopIds = uniq(products.map((product) => product.shopId));
    uniqueShopIds.forEach((shopId) => {
      if (!userHasPermission(["createProduct"], shopId)) {
        throw new ReactionError("access-denied", "Access Denied");
      }
    });
  }

  const success = await publishProductsToCatalog(productIds, collections);
  if (!success) {
    Logger.error("Some Products could not be published to the Catalog.");
    throw new ReactionError("server-error", "Some Products could not be published to the Catalog. Make sure your variants are visible.");
  }
  return Catalog.find({ "product.productId": { $in: productIds } }).toArray();
}
