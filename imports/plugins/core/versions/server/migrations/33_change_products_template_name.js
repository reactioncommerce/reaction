import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 33,
  up() {
    Packages.update({
      "layout.structure.template": "products"
    }, {
      $set: {
        "layout.$.structure.template": "Products"
      }
    }, { bypassCollection2: true, multi: true });

    Packages.update({
      "registry.template": "products"
    }, {
      $set: {
        "registry.$.template": "Products"
      }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Packages.update({
      "layout.structure.template": "Products"
    }, {
      $set: {
        "layout.$.structure.template": "products"
      }
    }, { bypassCollection2: true, multi: true });

    Packages.update({
      "registry.template": "Products"
    }, {
      $set: {
        "registry.$.template": "products"
      }
    }, { bypassCollection2: true, multi: true });
  }
});
