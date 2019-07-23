import Logger from "@reactioncommerce/logger";
import hashProduct from "./mutations/hashProduct";
import { customPublisherTransforms } from "./registration";

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
 *
 * @method sortPublisherTransforms
 * @summary This function sorts the Catalog publisher transfroms to run in order of dependency.
 * @param {Object[]} unsortedTransformList - Array of Publisher Transform info.
 * @return {Object[]} - Sorted array of Publisher Transforms.
 */
function sortPublisherTransforms (unsortedTransformList) {
  const sorted = [];
  const visited = {};

  const visit = (info, ancestors = []) => {
    const { name, dependsOn = [] } = info;
    ancestors.push(name);
    visited[name] = true;

    dependsOn.forEach((dep) => {
      // if already in ancestors, a closed chain exists.
      if (ancestors.indexOf(dep) >= 0) {
        // TODO: clean up error.
        throw new Error('Circular dependency "' +  dep + '" is required by "' + name + '": ' + ancestors.join(' -> '));
      }

      if (visited[dep]) return;
      const depInfo = unsortedTransformList.find((transformInfo) => transformInfo.name === dep);
      visit(depInfo, ancestors.slice(0))
    });

    sorted.push(info);
  }

  unsortedTransformList.forEach((info) => {
    visit(info);
  });

  return sorted;
}


/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const { appEvents, collections } = context;
  const sortedPublisherTransforms = sortPublisherTransforms(customPublisherTransforms);
  customPublisherTransforms.splice(0, customPublisherTransforms.length, ...sortedPublisherTransforms);

  appEvents.on("afterMediaInsert", ({ mediaRecord }) => {
    hashRelatedProduct(mediaRecord, collections).catch((error) => {
      Logger.error("Error in afterMediaInsert", error);
    });
  });

  appEvents.on("afterMediaUpdate", ({ mediaRecord }) => {
    hashRelatedProduct(mediaRecord, collections).catch((error) => {
      Logger.error("Error in afterMediaUpdate", error);
    });
  });

  appEvents.on("afterMediaRemove", ({ mediaRecord }) => {
    hashRelatedProduct(mediaRecord, collections).catch((error) => {
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
