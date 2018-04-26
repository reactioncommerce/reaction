import Logger from "@reactioncommerce/logger";

import isBackorder from "./isBackorder";
import isLowQuantity from "./isLowQuantity";
import isSoldOut from "./isSoldOut";

/**
 * TODO: rename to updateCatalogProductInventoryStatus
 * @method publishProductInventoryAdjustments
 * @summary Publish inventory updates for a single product to the Catalog
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @param {Object} collections - Raw mongo collections are passed to ProductRevision
 * @return {boolean} true on success, false on failure
 */
export default async function publishProductInventoryAdjustments(productId, collections) {
  const { Catalog, Products } = collections;
  const catalogProduct = await Catalog.findOne({
    _id: productId
  });

  if (!catalogProduct) {
    Logger.info("Cannot publish inventory status changes to catalog product");
    return false;
  }

  const variants = await Products.find({
    ancestors: productId
  }).toArray();

  const update = {
    isSoldOut: await isSoldOut(variants, collections),
    isBackorder: await isBackorder(variants, collections),
    isLowQuantity: await isLowQuantity(variants, collections)
  };

  // Only apply changes of one these fields have changed
  if (
    update.isSoldOut !== catalogProduct.isSoldOut ||
    update.isBackorder !== catalogProduct.isBackorder ||
    update.isLowQuantity !== catalogProduct.isLowQuantity
  ) {
    const result = await Catalog.update(
      {
        _id: productId
      },
      {
        $set: update
      }
    );

    return result && result.result && result.result.ok === 1;
  }

  return false;
}
