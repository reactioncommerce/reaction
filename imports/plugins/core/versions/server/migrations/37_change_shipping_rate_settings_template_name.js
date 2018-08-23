import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 37,
  up() {
    Packages.update({
      "registry.template": "shippingRatesSettings"
    }, {
      $set: {
        "registry.$.template": "ShippingRatesSettings"
      }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Packages.update({
      "registry.template": "ShippingRatesSettings"
    }, {
      $set: {
        "registry.$.template": "shippingRatesSettings"
      }
    }, { bypassCollection2: true, multi: true });
  }
});
