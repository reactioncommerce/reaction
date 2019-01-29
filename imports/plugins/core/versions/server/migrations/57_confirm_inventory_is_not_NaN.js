import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";

Migrations.add({
  version: 57,
  up() {
    collections.Products.update(
      {
        type: { $in: ["simple", "variant"] },
        inventoryAvailableToSell: NaN
      },
      {
        $set: { inventoryAvailableToSell: 0 }
      },
      {
        bypassCollection2: true,
        multi: true
      }
    );
  }
});
