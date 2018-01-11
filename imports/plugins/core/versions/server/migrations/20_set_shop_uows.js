import { Migrations } from "meteor/percolate:migrations";
import { Shops } from "/lib/collections";

Migrations.add({
  version: 20,
  up() {
    Shops.find().forEach((shop) => {
      if (!shop.baseUOW) {
        shop.baseUOW = "oz";
      } else {
        shop.baseUOW = shop.baseUOW.toLowerCase();
      }
      shop.unitsOfWeight = [{
        uow: "oz",
        label: "Ounces",
        default: true
      }, {
        uow: "lb",
        label: "Pounds"
      }, {
        uow: "g",
        label: "Grams"
      }, {
        uow: "kg",
        label: "Kilograms"
      }];

      Shops.update({ _id: shop._id }, {
        $set: {
          baseUOW: shop.baseUOW,
          unitsOfWeight: shop.unitsOfWeight
        }
      });
    });
  },
  down() {
    Shops.find().forEach((shop) => {
      if (!shop.baseUOM) {
        shop.baseUOM = "oz";
      } else {
        shop.baseUOM = shop.baseUOM.toLowerCase();
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
      });
    });
  }
});
