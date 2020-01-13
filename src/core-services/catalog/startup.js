import Logger from "@reactioncommerce/logger";
import hashProduct from "./mutations/hashProduct.js";

/**
 * @summary Recalculate the currentProductHash for the related product
 * @param {Object} productId The product to hash
 * @param {Object} collections Map of MongoDB collections
 * @returns {Promise<null>} Null
 */
async function hashRelatedProduct(productId, collections) {
  if (productId) {
    hashProduct(productId, collections, false)
      .catch((error) => {
        Logger.error(`Error updating currentProductHash for product with ID ${productId}`, error);
      });
  }

  return null;
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function catalogStartup(context) {
  const { appEvents, collections } = context;

  appEvents.on("afterMediaInsert", ({ mediaRecord }) => {
    const { productId } = mediaRecord.metadata || {};
    hashRelatedProduct(productId, collections).catch((error) => {
      Logger.error("Error in afterMediaInsert", error);
    });
  });

  appEvents.on("afterMediaUpdate", ({ mediaRecord }) => {
    const { productId } = mediaRecord.metadata || {};
    hashRelatedProduct(productId, collections).catch((error) => {
      Logger.error("Error in afterMediaUpdate", error);
    });
  });

  appEvents.on("afterMediaRemove", ({ mediaRecord }) => {
    const { productId } = mediaRecord.metadata || {};
    hashRelatedProduct(productId, collections).catch((error) => {
      Logger.error("Error in afterMediaRemove", error);
    });
  });

  appEvents.on("afterProductSoftDelete", ({ product }) => {
    collections.Catalog.updateOne({
      "product.productId": product._id
    }, {
      $set: {
        "product.isDeleted": true
      }
    });
  });

  appEvents.on("afterProductUpdate", ({ productId }) => {
    hashRelatedProduct(productId, collections).catch((error) => {
      Logger.error("Error in afterProductUpdate", error);
    });
  });

  appEvents.on("afterVariantUpdate", async ({ productId }) => {
    hashRelatedProduct(productId, collections).catch((error) => {
      Logger.error("Error in afterVariantUpdate", error);
    });
  });
}
