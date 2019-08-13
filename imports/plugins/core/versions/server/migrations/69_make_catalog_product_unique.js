import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";

/**
 * @private
 * @param {Error} error Error or null
 * @returns {undefined}
 */
function handleError(error) {
  // This may fail if the index or the collection doesn't exist, which is what we want anyway
  if (
    error &&
    (
      typeof error.message !== "string" ||
      (!error.message.includes("index not found") && !error.message.includes("ns not found"))
    )
  ) {
    Logger.warn(error, "Caught error from dropIndex calls in migration 69");
  }
}

/**
 * Drop all indexes that support queries that are no longer expected
 * to be made by any plugins, or that are already supported by other
 * indexes.
 */
Migrations.add({
  version: 69,
  up() {
    const { Catalog } = rawCollections;
    Catalog.dropIndex("product.productId", (err) => {
      if (err) handleError(err);
      else Catalog.createIndex("product.productId", { unique: true, background: true }, handleError);
    });
    Catalog.dropIndex("product.product._id", (err) => {
      if (err) handleError(err);
      else Catalog.createIndex("product.product._id", { unique: true, background: true }, handleError);
    });
  }
});
