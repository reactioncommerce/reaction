
import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";
import { convertCatalogItemVariants } from "../util/convert57";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 57,
  up() {
    collections.Products.update(
      {
        inventoryAvailableToSell: { $in: [NaN, null] }
      },
      {
        $set: { inventoryAvailableToSell: 0 }
      },
      {
        bypassCollection2: true,
        multi: true
      }
    );

    collections.Products.update(
      {
        inventoryInStock: { $in: [NaN, null] }
      },
      {
        $set: { inventoryInStock: 0 }
      },
      {
        bypassCollection2: true,
        multi: true
      }
    );

    findAndConvertInBatches({
      collection: collections.Catalog,
      converter: (catalogItem) => convertCatalogItemVariants(catalogItem, collections)
    });
  }
});
