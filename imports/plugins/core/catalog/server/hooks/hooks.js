import Hooks from "@reactioncommerce/hooks";
import { Catalog } from "/lib/collections";

/**
 * @summary archives product in the Catalog collection when it is archived in Products collection
 * @param {String} userId - userId of user making the call
 * @param {Object} doc - product document
 * @return {undefined}
 * @private
 */
Hooks.Events.add("afterRemoveCatalogProduct", (userId, doc) => {
  // If this is a top level product, update the `Catalog` collection
  // to set `isDeleted` to true
  if (doc.type === "simple") {
    Catalog.update({
      "product.productId": doc._id
    }, {
      $set: {
        "product.isDeleted": true
      }
    });
  }

  return doc;
});
