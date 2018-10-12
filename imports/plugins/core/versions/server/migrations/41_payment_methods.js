import { Migrations } from "meteor/percolate:migrations";
import { Packages, Shops } from "/lib/collections";

Migrations.add({
  version: 41,

  up() {
    const shops = Shops.find();

    for (const shop of shops) {
      const methods = new Set(shop.availablePaymentMethods);

      const packages = Packages.find({
        shopId: shop._id,
        enabled: true,
        "registry.provides": "paymentMethod"
      });

      for (const pkg of packages) {
        if (pkg.name === "example-paymentmethod") {
          methods.add("iou_example");
        } else if (pkg.name === "reaction-stripe") {
          methods.add("stripe_card");
          methods.add("marketplace_stripe_card");
        }
      }

      Shops.update(
        { _id: shop._id },
        { $set: { availablePaymentMethods: Array.from(methods) } },
        { bypassCollection2: true }
      );
    }
  },

  down() {
    Shops.update(
      {},
      { $unset: { availablePaymentMethods: null } },
      { bypassCollection2: true, multi: true }
    );
  }
});
