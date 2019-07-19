import { Migrations } from "meteor/percolate:migrations";
import { MongoInternals } from "meteor/mongo";
import { transformInventoryOnCatalog } from "../util/convert68";
import rawCollections from "/imports/collections/rawCollections";
import findAndConvertInBatches from "../no-meteor/util/findAndConvertInBatches";

const { db } = MongoInternals.defaultRemoteCollectionDriver().mongo;

const SimpleInventory = db.collection("SimpleInventory");

// Add isSoldOut on every variant and option in every Catalog document
Migrations.add({
  version: 68,
  up() {
    const { AppSettings, Catalog, Products } = rawCollections;

    // Catalog
    Promise.await(findAndConvertInBatches({
      collection: Catalog,
      converter: async (catalogItem) => {
        await transformInventoryOnCatalog(catalogItem.product, {
          context: {
            collections: { AppSettings, Products, SimpleInventory }
          }
        });

        return catalogItem;
      }
    }));
  }
});
