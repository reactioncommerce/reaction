import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";

Migrations.add({
  version: 56,
  up() {
    collections.Products.update(
      {
        type: { $in: ["simple", "variant"] }
      },
      {
        $rename: { inventoryQuantity: "inventoryInStock" }
      },
      {
        bypassCollection2: true,
        multi: true
      }
    );
  },
  down() {
    collections.Products.update(
      {
        type: { $in: ["simple", "variant"] }
      },
      {
        $rename: { inventoryInStock: "inventoryQuantity" }
      },
      {
        bypassCollection2: true,
        multi: true
      }
    );
  }
});
