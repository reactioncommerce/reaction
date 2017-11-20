import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

Migrations.add({
  // Initializes shops without a baseUOL and without unitsOfLength to our default
  version: 17,
  up() {
    Shops.update({
      baseUOL: { $exists: false },
      unitsOfLength: { $exists: false }
    }, {
      $set: {
        baseUOL: "in",
        unitsOfLength: [{
          uol: "in",
          label: "Inches",
          default: true
        }, {
          uol: "cm",
          label: "Centimeters"
        }, {
          uol: "ft",
          label: "Feet"
        }]
      }
    }, { bypassCollection2: true, multi: true });
  },
  down() {
    Shops.update({
      baseUOL: { $exists: true },
      unitsOfLength: { $exists: true }
    }, {
      $unset: {
        baseUOL: "",
        unitsOfLength: ""
      }
    }, { bypassCollection2: true, multi: true });
  }
});
