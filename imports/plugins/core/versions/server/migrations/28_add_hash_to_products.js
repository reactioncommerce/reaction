import Logger from "@reactioncommerce/logger";
import { Migrations } from "meteor/percolate:migrations";
import { Catalog } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import hashProduct from "../util/hashProduct";

Migrations.add({
  version: 28,
  up() {
    const catalogItems = Catalog.find({
      "product.type": "product-simple"
    }).fetch();

    try {
      catalogItems.forEach((catalogItem) => Promise.await(hashProduct(catalogItem.product._id, collections)));
    } catch (error) {
      Logger.error("Error in migration 28, hashProduct", error);
    }
  }
});
