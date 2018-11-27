import { Migrations } from "meteor/percolate:migrations";
import { Products } from "/lib/collections";

/**
 * @file
 * Updates all existing products to set shouldAppearInSitemap to true
 */

const productsSelector = { type: "simple" };

Migrations.add({
  version: 41,
  up() {
    Products.rawCollection().update(productsSelector, {
      $set: {
        shouldAppearInSitemap: true
      }
    }, {
      multi: true
    });
  },
  down() {
    Products.rawCollection().update(productsSelector, {
      $unset: {
        shouldAppearInSitemap: ""
      }
    }, {
      multi: true
    });
  }
});
