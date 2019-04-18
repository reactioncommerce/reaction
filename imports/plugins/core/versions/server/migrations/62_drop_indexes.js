import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import rawCollections from "/imports/collections/rawCollections";

const {
  Catalog
} = rawCollections;

/**
 * Drop all indexes that support queries that are no longer expected
 * to be made by any plugins, or that are already supported by other
 * indexes.
 */
Migrations.add({
  version: 62,
  up() {
    try {
      Catalog.dropIndex("createdAt_1");
      Catalog.dropIndex("updatedAt_1");
    } catch (error) {
      // This may fail if the index doesn't exist, which is what we want anyway
      Logger.warn(error, "Caught error from dropIndex calls in migration 62");
    }
  }
});
