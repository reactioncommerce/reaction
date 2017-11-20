import { Migrations } from "meteor/percolate:migrations";
import { Cart, Orders } from "/lib/collections";
import { Reaction } from "/server/api/";

Migrations.add({
  version: 12,
  up() {
    // moving to multi-shop setup requires each billing objects to be marked by shopId
    // This adds shopId field to each billing object in orders and carts.
    const shopId = Reaction.getShopId();

    Orders.update({}, {
      $set: { "billing.0.shopId": shopId }
    }, { bypassCollection2: true, multi: true });

    Cart.update({}, {
      $set: { "billing.0.shopId": shopId }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Orders.update({}, {
      $unset: { "billing.0.shopId": "" }
    }, { bypassCollection2: true, multi: true });

    Cart.update({}, {
      $set: { "billing.0.shopId": "" }
    }, { bypassCollection2: true, multi: true });
  }
});
