import { Migrations } from "meteor/percolate:migrations";
import { Cart, Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

const shippingFieldExistsAndHasItems = { shipping: { $exists: true, $ne: [] } };

Migrations.add({
  version: 13,
  up() {
    // moving to multi-shop setup requires each shipping objects to be marked by shopId
    // This adds shopId field to each shipping object in orders and carts.
    const shopId = Reaction.getShopId();

    Orders.update(shippingFieldExistsAndHasItems, {
      $set: { "shipping.0.shopId": shopId }
    }, { bypassCollection2: true, multi: true });

    Cart.update(shippingFieldExistsAndHasItems, {
      $set: { "shipping.0.shopId": shopId }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Orders.update({}, {
      $unset: { "shipping.0.shopId": "" }
    }, { bypassCollection2: true, multi: true });

    Cart.update({}, {
      $unset: { "shipping.0.shopId": "" }
    }, { bypassCollection2: true, multi: true });
  }
});
