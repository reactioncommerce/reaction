import Logger from "@reactioncommerce/logger";
import hashProduct from "./mutations/hashProduct.js";

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
    if (productId) {
      hashProduct(productId, collections, false).catch((error) => {
        Logger.error(`Error updating currentProductHash for product with ID ${productId}`, error);
      });
    }
  });

  appEvents.on("afterMediaUpdate", ({ mediaRecord }) => {
    const { productId } = mediaRecord.metadata || {};
    if (productId) {
      hashProduct(productId, collections, false).catch((error) => {
        Logger.error(`Error updating currentProductHash for product with ID ${productId}`, error);
      });
    }
  });

  appEvents.on("afterMediaRemove", ({ mediaRecord }) => {
    const { productId } = mediaRecord.metadata || {};
    if (productId) {
      hashProduct(productId, collections, false).catch((error) => {
        Logger.error(`Error updating currentProductHash for product with ID ${productId}`, error);
      });
    }
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

  const productOrVariantUpdateHandler = ({ productId }) => {
    if (productId) {
      hashProduct(productId, collections, false).catch((error) => {
        Logger.error(`Error updating currentProductHash for product with ID ${productId}`, error);
      });
    }
  };

  appEvents.on("afterProductUpdate", productOrVariantUpdateHandler);
  appEvents.on("afterVariantUpdate", productOrVariantUpdateHandler);
}
