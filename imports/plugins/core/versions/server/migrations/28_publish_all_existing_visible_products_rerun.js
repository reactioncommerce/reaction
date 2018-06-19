import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import { Products } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import publishProductsToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductsToCatalog";

// This migration is identical to version: 24
// It is being re-run because version: 27 requires all products to be published again
Migrations.add({
  version: 28,
  up() {
    const visiblePublishedProducts = Products.find({
      ancestors: [],
      isDeleted: { $ne: true },
      isVisible: true,
      type: "simple"
    }, { _id: 1 }).map((product) => product._id);
    const success = Promise.await(publishProductsToCatalog(visiblePublishedProducts, collections));
    if (!success) {
      Logger.error("Migration 28 failed to create catalog products for some published products.");
    }
  }
});
