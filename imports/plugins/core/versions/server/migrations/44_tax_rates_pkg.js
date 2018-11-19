import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 44,

  up() {
    Packages.update({
      name: "reaction-taxes"
    }, {
      $pull: {
        registry: { template: "customTaxRates" }
      }
    }, { bypassCollection2: true });
  },

  down() {
    Packages.update({
      name: "reaction-taxes"
    }, {
      $push: {
        registry: {
          label: "Custom Rates",
          name: "taxes/settings/rates",
          provides: ["taxSettings"],
          template: "customTaxRates"
        }
      }
    }, { bypassCollection2: true });
  }
});
