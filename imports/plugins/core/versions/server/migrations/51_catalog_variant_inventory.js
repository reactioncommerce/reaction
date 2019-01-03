import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";
import { addInventoryAvailableToSellFieldToProduct, convertCatalogItemVariants } from "../util/convert51";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 51,
  up() {
    // Update product to include `inventoryAvailableToSell` Field
    findAndConvertInBatches({
      collection: collections.Products,
      converter: (productItem) => addInventoryAvailableToSellFieldToProduct(productItem, collections)
    });

    // Publish changes to the Catalog
    findAndConvertInBatches({
      collection: collections.Catalog,
      converter: (catalogItem) => convertCatalogItemVariants(catalogItem, collections)
    });
  }
});
