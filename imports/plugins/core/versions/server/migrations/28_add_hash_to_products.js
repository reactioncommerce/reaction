import { Migrations } from "meteor/percolate:migrations";
import { Catalog } from "/lib/collections";
import collections from "/imports/collections/rawCollections";
import hashProduct from "/imports/plugins/core/catalog/server/no-meteor/mutations/hashProduct";

Migrations.add({
  version: 28,
  up() {
    const products = Catalog.find({
      "product.type": "product-simple"
    }).fetch();

    products.forEach((product) => Promise.await(hashProduct(product.product._id, collections)));
  }
});
