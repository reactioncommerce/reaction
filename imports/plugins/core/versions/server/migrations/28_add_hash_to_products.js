import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";
import hashProduct from "../util/hashProduct";
import findAndConvertInBatches from "../no-meteor/util/findAndConvertInBatches";

Migrations.add({
  version: 28,
  up() {
    const { Catalog } = rawCollections;

    Promise.await(findAndConvertInBatches({
      collection: Catalog,
      query: {
        "product.type": "product-simple"
      },
      converter: async (catalogItem) => hashProduct(catalogItem.product._id, rawCollections)
    }));
  }
});
