import { Migrations } from "meteor/percolate:migrations";
import { Catalog, Products } from "/lib/collections";
import { convertCatalogItemVariants } from "../util/convert42";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 42,
  up() {
    // Catalog
    findAndConvertInBatches({
      collection: Catalog,
      converter: (catalogItem) => convertCatalogItemVariants(catalogItem, { Products })
    });
  }
});
