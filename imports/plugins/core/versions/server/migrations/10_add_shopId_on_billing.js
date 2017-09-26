import { Migrations } from "/imports/plugins/core/versions";
import { Cart, Orders } from "/lib/collections";
import { Reaction } from "/server/api/";

Migrations.add({
  version: 10,
  up() {
    // moving to multi-shop setup requries each billing objects to be marked by shopId
    // This adds shopId field to each billing object in orders and carts.
    const shopId = Reaction.getShopId();

    Orders.update({}, {
      $set: { "billing.0.shopId": shopId }
    }, {
      multi: true
    });

    Cart.update({}, {
      $set: { "billing.0.shopId": shopId }
    }, {
      multi: true
    });
  },
  down() {
    Orders.update({}, {
      $unset: { "billing.0.shopId": "" }
    }, {
      multi: true
    });

    Cart.update({}, {
      $set: { "billing.0.shopId": "" }
    }, {
      multi: true
    });
  }
});
