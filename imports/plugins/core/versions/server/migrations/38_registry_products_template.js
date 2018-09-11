import { Migrations } from "meteor/percolate:migrations";
import { Packages, Shops } from "/lib/collections";

/**
 * This is an update to migration 33, which missed a couple things:
 * (1) The $ by default updates only the first matching array, but we want to update all
 * (2) The layouts are also stored in the Shops collection and need to be updated there as well.
 *
 * Note that we use rawCollection because Meteor collections do not forward the arrayFilters option yet.
 */

Migrations.add({
  version: 38,
  up() {
    Packages.rawCollection().update({
      "layout.structure.template": "products"
    }, {
      $set: {
        "layout.$[elem].structure.template": "Products"
      }
    }, {
      arrayFilters: [{ "elem.structure.template": "products" }],
      multi: true
    });

    Packages.rawCollection().update({
      "registry.template": "products"
    }, {
      $set: {
        "registry.$[elem].template": "Products"
      }
    }, {
      arrayFilters: [{ "elem.template": "products" }],
      multi: true
    });

    Shops.rawCollection().update({
      "layout.structure.template": "products"
    }, {
      $set: {
        "layout.$[elem].structure.template": "Products"
      }
    }, {
      arrayFilters: [{ "elem.structure.template": "products" }],
      multi: true
    });
  },
  down() {
    Packages.rawCollection().update({
      "layout.structure.template": "Products"
    }, {
      $set: {
        "layout.$[elem].structure.template": "products"
      }
    }, {
      arrayFilters: [{ "elem.structure.template": "Products" }],
      multi: true
    });

    Packages.rawCollection().update({
      "registry.template": "Products"
    }, {
      $set: {
        "registry.$[elem].template": "products"
      }
    }, {
      arrayFilters: [{ "elem.template": "Products" }],
      multi: true
    });

    Shops.rawCollection().update({
      "layout.structure.template": "Products"
    }, {
      $set: {
        "layout.$[elem].structure.template": "products"
      }
    }, {
      arrayFilters: [{ "elem.structure.template": "Products" }],
      multi: true
    });
  }
});
