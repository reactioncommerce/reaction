import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";
import hashProduct from "../util/hashProduct";
import findAndConvertInBatches from "../util/findAndConvertInBatchesNoMeteor";

const { Catalog } = rawCollections;

Migrations.add({
  version: 28,
  up() {
    Promise.await(findAndConvertInBatches({
      collection: Catalog,
      query: {
        "product.type": "product-simple"
      },
      converter: async (catalogItem) => hashProduct(catalogItem.product._id, rawCollections)
    }));
  }
});
