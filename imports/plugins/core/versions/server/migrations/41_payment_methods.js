import { Migrations } from "meteor/percolate:migrations";
import { Packages, Shops } from "/lib/collections";

Migrations.add({
  version: 41,

  up() {
    Shops.find().forEach((shop) => {
      const methods = new Set(shop.availablePaymentMethods);

      Packages.find({
        "shopId": shop._id,
        "enabled": true,
        "registry.provides": "paymentMethod"
      })
        .forEach((pkg) => {
          if (pkg.name === "example-paymentmethod") {
            methods.add("iou_example");
          } else if (pkg.name === "reaction-stripe") {
            methods.add("stripe_card");
            methods.add("marketplace_stripe_card");
          }
        });

      Shops.update(
        { _id: shop._id },
        { $set: { availablePaymentMethods: Array.from(methods) } },
        { bypassCollection2: true }
      );
    });
  },

  down() {
    Shops.update(
      {},
      { $unset: { availablePaymentMethods: null } },
      { bypassCollection2: true, multi: true }
    );
  }
});
