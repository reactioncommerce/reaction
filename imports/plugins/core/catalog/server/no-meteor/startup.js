import Logger from "@reactioncommerce/logger";
import hashProduct from "./mutations/hashProduct";

/**
 * @summary Recalculate the currentProductHash for the related product
 * @param {Object} media The media document
 * @param {Object} collections Map of MongoDB collections
 * @return {Promise<null>} Null
 */
async function hashRelatedProduct(media, collections) {
  if (!media) {
    throw new Error("hashRelatedProduct called with no media argument");
  }

  const { productId } = media.metadata || {};
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
export default function startup(context) {
  const { appEvents, collections } = context;

  appEvents.on("afterMediaInsert", (media) => {
    hashRelatedProduct(media, collections).catch((error) => {
      Logger.error("Error in afterMediaInsert", error);
    });
  });

  appEvents.on("afterMediaUpdate", (media) => {
    hashRelatedProduct(media, collections).catch((error) => {
      Logger.error("Error in afterMediaUpdate", error);
    });
  });

  appEvents.on("afterMediaRemove", (media) => {
    hashRelatedProduct(media, collections).catch((error) => {
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
}
