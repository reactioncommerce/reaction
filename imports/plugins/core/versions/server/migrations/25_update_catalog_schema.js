/* eslint-disable require-jsdoc */
import { Migrations } from "meteor/percolate:migrations";
import _ from "lodash";
import { Catalog, Shops } from "/lib/collections";
import convertCatalogItem from "../util/convertCatalogItem";

// Do this migration in batches of 200 to avoid memory issues
const LIMIT = 200;

function getShopsForItems(items) {
  const uniqueShopIds = _.uniq(items.map(({ shopId }) => shopId));

  return Shops.find(
    {
      _id: { $in: uniqueShopIds }
    },
    {
      fields: {
        currencies: 1,
        currency: 1
      }
    }
  ).fetch();
}

Migrations.add({
  version: 25,
  up() {
    let items;

    do {
      items = Catalog.find({
        // We moved everything to a `product` object, so checking for the existence of that
        // seems like a good way to find everything we haven't converted yet.
        product: { $exists: false }
      }, {
        limit: LIMIT,
        sort: {
          createdAt: 1
        }
      }).fetch();

      if (items.length) {
        const shops = getShopsForItems(items);

        items.forEach((item) => {
          const shop = shops.find(({ _id }) => _id === item.shopId);
          const doc = convertCatalogItem(item, shop);
          Catalog.update({ _id: item._id }, doc, { bypassCollection2: true });
        });
      }
    } while (items.length);
  }
});
