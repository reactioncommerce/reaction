import { Migrations } from "meteor/percolate:migrations";
import Logger from "@reactioncommerce/logger";
import { Products } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import publishProductsToCatalog from "/imports/node-app/core-services/catalog/utils/publishProductsToCatalog.js";

Migrations.add({
  version: 32,
  up() {
    const visiblePublishedProducts = Products.find({
      ancestors: [],
      isDeleted: { $ne: true },
      isVisible: true,
      type: "simple"
    }, { _id: 1 }).map((product) => product._id);
    let success = false;
    try {
      success = Promise.await(publishProductsToCatalog(visiblePublishedProducts, {
        appEvents: {
          emit() {},
          on() {}
        },
        collections,
        getFunctionsOfType: () => []
      }));
    } catch (error) {
      Logger.error("Error in migration 32, publishProductsToCatalog", error);
    }

    if (!success) {
      Logger.error("Migration 32 failed to create catalog products for some published products.");
    }
  }
});
