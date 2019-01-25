import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 52,
  up() {
    Packages.update({
      name: "reaction-taxes"
    }, {
      $rename: { "settings.activeTaxServiceName": "settings.primaryTaxServiceName" }
    }, {
      multi: true
    });
  },
  down() {
    Packages.update({
      name: "reaction-taxes"
    }, {
      $rename: { "settings.primaryTaxServiceName": "settings.activeTaxServiceName" }
    }, {
      multi: true
    });
  }
});
