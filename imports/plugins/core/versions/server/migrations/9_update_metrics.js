import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

Migrations.add({
  version: 9,
  up() {
    Shops.find().forEach((shop) => {
      // Default baseUOM to oz
      if (!shop.baseUOM) {
        shop.baseUOM = "oz";
      } else {
        shop.baseUOM = shop.baseUOM.toLowerCase();
      }

      // normalize grams to "g"
      if (shop.baseUOM === "gr") {
        shop.baseUOM = "g";
      }

      shop.unitsOfMeasure = [{
        uom: "oz",
        label: "Ounces",
        default: true
      }, {
        uom: "lb",
        label: "Pounds"
      }, {
        uom: "g",
        label: "Grams"
      }, {
        uom: "kg",
        label: "Kilograms"
      }];

      Shops.update({ _id: shop._id }, {
        $set: {
          baseUOM: shop.baseUOM,
          unitsOfMeasure: shop.unitsOfMeasure
        }
      }, { bypassCollection2: true });
    });
  },
  down() {
    Shops.find().forEach((shop) => {
      shop.baseUOM = shop.baseUOM && shop.baseUOM.toUpperCase();
      Shops.update({ _id: shop._id }, {
        $set: {
          baseUOM: shop.baseUOM
        }
      }, { bypassCollection2: true });
    });
  }
});
