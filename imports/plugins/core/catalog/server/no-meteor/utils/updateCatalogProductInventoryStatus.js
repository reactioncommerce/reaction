import Logger from "@reactioncommerce/logger";
import isBackorder from "./isBackorder";
import isLowQuantity from "./isLowQuantity";
import isSoldOut from "./isSoldOut";

/**
 *
 * @method updateCatalogProductInventoryStatus
 * @summary Update inventory status for a single Catalog Product.
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @param {Object} collections - Raw mongo collections
 * @return {Promise<boolean>} true on success, false on failure
 */
export default async function updateCatalogProductInventoryStatus(productId, collections) {
  const { Catalog, Products } = collections;
  const catalogItem = await Catalog.findOne({ "product.productId": productId });

  if (!catalogItem) {
    Logger.info("Cannot publish inventory status changes to catalog product");
    return false;
  }

  const catalogProduct = catalogItem.product;

  const variants = await Products.find({ ancestors: productId }).toArray();

  const update = {
    "product.isSoldOut": isSoldOut(variants),
    "product.isBackorder": isBackorder(variants),
    "product.isLowQuantity": isLowQuantity(variants)
  };

  // Only apply changes if one of these fields have changed
  if (
    update["product.isSoldOut"] !== catalogProduct.isSoldOut ||
    update["product.isBackorder"] !== catalogProduct.isBackorder ||
    update["product.isLowQuantity"] !== catalogProduct.isLowQuantity
  ) {
    const result = await Catalog.updateOne(
      {
        "product.productId": productId
      },
      {
        $set: update
      }
    );

    return result && result.result && result.result.ok === 1;
  }

  return false;
}
