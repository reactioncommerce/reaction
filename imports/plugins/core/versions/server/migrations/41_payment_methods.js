import * as _ from "lodash";
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
          if (pkg.name === "example-paymentmethod" && _.get(pkg, "settings.example-paymentmethod.enabled")) {
            methods.add("iou_example");
          } else if (pkg.name === "reaction-stripe" && _.get(pkg, "settings.reaction-stripe.enabled")) {
            methods.add("stripe_card");
          }
        });

      const marketplacePkg = Packages.findOne({
        shopId: shop._id,
        enabled: true,
        name: "reaction-marketplace"
      });
      if (marketplacePkg && marketplacePkg.enabled) {
        // We would never want both stripe card methods enabled, and marketplace should take precedence
        methods.delete("stripe_card");
        methods.add("marketplace_stripe_card");
      }

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
