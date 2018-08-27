import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

/**
 * Going up, adds type
 * Going down, removes type
 */

Migrations.add({
  version: 36,
  up() {
    Shops.find({}).forEach((shop) => {
      if (shop.currencies && shop.currencies.updatedAt) {
        const { updatedAt } = shop.currencies;
        Shops.update({ _id: shop._id }, {
          $set: {
            currenciesUpdatedAt: updatedAt
          },
          $unset: {
            "currencies.updatedAt": 1
          }
        }, { bypassCollection2: true });
      }
    });
  },
  down() {
    Shops.find({}).forEach((shop) => {
      const { currenciesUpdatedAt: updatedAt } = shop;
      if (shop.currencies && shop.currenciesUpdatedAt) {
        Shops.update({ _id: shop._id }, {
          $set: {
            "currencies.updatedAt": updatedAt
          },
          $unset: {
            currenciesUpdatedAt: 1
          }
        }, { bypassCollection2: true });
      }
    });
  }
});
