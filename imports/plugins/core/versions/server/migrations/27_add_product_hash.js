import { Migrations } from "meteor/percolate:migrations";
import { Products } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import hashProduct from "/imports/plugins/core/catalog/server/no-meteor/utils/hashProduct";

// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

Migrations.add({
  version: 27,
  up() {
    let products;

    do {
      products = Products.find({
        type: "simple"
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (products.length) {
        products.forEach((product) => Promise.await(hashProduct(product, collections)));
      }
    } while (products.length);
  }
});
