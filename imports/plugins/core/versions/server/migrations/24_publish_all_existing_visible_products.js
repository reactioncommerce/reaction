import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import { Products } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import publishProductsToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductsToCatalog";

Migrations.add({
  version: 24,
  up() {
    const visiblePublishedProducts = Products.find({
      ancestors: [],
      isDeleted: { $ne: true },
      isVisible: true,
      type: "simple"
    }, { _id: 1 }).map((product) => product._id);

    let success = false;
    try {
      success = Promise.await(publishProductsToCatalog(visiblePublishedProducts, { collections, getFunctionsOfType: () => [] }));
    } catch (error) {
      Logger.error("Error in migration 24, publishProductsToCatalog", error);
    }

    if (!success) {
      Logger.error("Migration 24 failed to create catalog products for some published products.");
    }
  }
});
