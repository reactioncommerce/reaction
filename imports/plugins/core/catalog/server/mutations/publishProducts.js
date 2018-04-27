import { Meteor } from "meteor/meteor";
import Logger from "@reactioncommerce/logger";
import { uniq } from "lodash";
import publishProductsToCatalog from "./publishProductsToCatalog";

/**
 * TODO:
 * @method publishProducts
 * @summary
 * @param {Object} context - TODO
 * @param {Array}
 * @return {Promise<Object[]>} TODO:
 */
export default async function publishProducts(context, productIds) {
  const { collections, shopId: primaryShopId, userHasPermission } = context;
  const { Catalog, Products } = collections;
  // Ensure user has createProduct permission for active shop
  if (!userHasPermission("createProduct")) {
    Logger.error("Access Denied");
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Find all products
  const products = Products.find(
    {
      _id: { $in: productIds }
    },
    { _id: 1, shopId: 1 }
  ).fetch();

  if (products.length !== productIds.length) {
    throw new Meteor.Error("not-found", "Some products not found");
  }

  // Only allow users to publish products for shops they permissions to createProductsFor
  // If the user can createProducts on the main shop, they can publish products for all shops to the catalog.
  const canUpdatePrimaryShopProducts = userHasPermission("createProduct", primaryShopId);

  if (!canUpdatePrimaryShopProducts) {
    const uniqueShopIds = uniq(products.map((product) => product.shopId));
    uniqueShopIds.forEach((shopId) => {
      if (!userHasPermission("createProduct", shopId)) {
        throw new Meteor.Error("access-denied", "Access Denied");
      }
    });
  }

  const success = await publishProductsToCatalog(productIds, collections);

  if (!success) {
    Logger.error("Some Products could not be published to the Catalog.");
    throw new Meteor.Error("server-error", "Some Products could not be published to the Catalog.");
  }

  return Catalog.find({ "product.productId": { $in: productIds } }).toArray();
}
