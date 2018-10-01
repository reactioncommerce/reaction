import { Migrations } from "meteor/percolate:migrations";
import { Cart, Notifications, Orders, Packages } from "/lib/collections";
import { convertCart, convertOrder } from "../util/convert20";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 40,
  up() {
    const packages = Packages.find({}).fetch();

    // Orders
    findAndConvertInBatches({
      collection: Orders,
      converter: (order) => convertOrder(order, packages)
    });

    // Carts
    findAndConvertInBatches({
      collection: Cart,
      converter: convertCart
    });

    // Notifications
    // The status should always be set, but we'll make sure since it's now a required field.
    Notifications.update({
      status: null
    }, {
      $set: {
        status: "unread"
      }
    }, { multi: true, bypassCollection2: true });
  }
});
