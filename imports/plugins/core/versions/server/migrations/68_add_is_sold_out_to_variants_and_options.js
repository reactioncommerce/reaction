import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";
import { convertCatalogItemVariants } from "../util/convert68";
import rawCollections from "/imports/collections/rawCollections";
import findAndConvertInBatches from "../no-meteor/util/findAndConvertInBatches";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const SimpleInventory = db.collection("SimpleInventory");

Migrations.add({
  version: 68,
  up() {
    const { AppSettings, Catalog, Products } = rawCollections;

    // Catalog
    Promise.await(findAndConvertInBatches({
      collection: Catalog,
      converter: async (catalogItem) => convertCatalogItemVariants(catalogItem, { AppSettings, Products, SimpleInventory })
    }));
  }
});
