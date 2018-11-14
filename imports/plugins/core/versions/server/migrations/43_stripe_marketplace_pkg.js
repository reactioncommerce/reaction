import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 43,

  up() {
    Packages.find({ name: "example-paymentmethod" }).forEach((pkg) => {
      if (pkg.settings && pkg.settings["example-paymentmethod"]) {
        Packages.update({ _id: pkg._id }, {
          $set: {
            "settings.support": pkg.settings["example-paymentmethod"].support || ["Authorize", "Capture", "Refund"]
          },
          $unset: {
            "settings.example-paymentmethod": ""
          }
        }, { bypassCollection2: true });
      }
    });

    Packages.find({ name: "reaction-stripe" }).forEach((pkg) => {
      const updatedRegistry = (pkg.registry || []).reduce((list, item) => {
        if (item.template !== "stripeConnectAuthorize" && item.template !== "stripeConnectMerchantSignup") {
          list.push(item);
        }
        return list;
      }, []);

      const modifier = { $set: { registry: updatedRegistry } };

      if (pkg.settings && pkg.settings["reaction-stripe"]) {
        modifier.$set["settings.support"] = pkg.settings["reaction-stripe"].support || ["Authorize", "Capture", "Refund"];
        modifier.$unset = {
          "settings.reaction-stripe": ""
        };
      }

      Packages.update({ _id: pkg._id }, modifier, { bypassCollection2: true });
    });

    Packages.find({ name: "reaction-marketplace" }).forEach((pkg) => {
      if (Array.isArray(pkg.registry)) {
        if (!pkg.registry.find((item) => item.template === "stripeMarketplaceSettings")) {
          pkg.registry.push({
            label: "Stripe for Marketplace",
            provides: ["paymentSettings"],
            container: "dashboard",
            template: "stripeMarketplaceSettings",
            hideForShopTypes: ["merchant", "affiliate"]
          });
        }

        if (!pkg.registry.find((item) => item.template === "stripeMarketplacePaymentForm")) {
          pkg.registry.push({
            template: "stripeMarketplacePaymentForm",
            provides: ["paymentMethod"],
            icon: "fa fa-cc-stripe"
          });
        }

        if (!pkg.registry.find((item) => item.template === "stripeConnectAuthorize")) {
          pkg.registry.push({
            route: "/stripe/connect/authorize",
            template: "stripeConnectAuthorize"
          });
        }

        if (!pkg.registry.find((item) => item.template === "stripeConnectMerchantSignup")) {
          pkg.registry.push({
            label: "Stripe Merchant Account",
            icon: "fa fa-cc-stripe",
            container: "dashboard",
            provides: ["marketplaceMerchantSettings"],
            template: "stripeConnectMerchantSignup",
            hideForShopTypes: ["primary"]
          });
        }
      }

      Packages.update({ _id: pkg._id }, {
        $set: {
          registry: pkg.registry
        }
      }, { bypassCollection2: true });
    });
  }
});
