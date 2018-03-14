import { Migrations } from "meteor/percolate:migrations";
import { Products } from "/lib/collections";
import { publishProductsToCatalog } from "/imports/plugins/core/catalog/server/methods/catalog";

Migrations.add({
  version: 24,
  up() {
    const visiblePublishedProducts = Products.find(
      { isVisible: true, isDeleted: false, type: "simple" },
      { _id: 1 }
    ).map((product) => product._id);
    publishProductsToCatalog(visiblePublishedProducts);
  }
});
