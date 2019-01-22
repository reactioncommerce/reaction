import { Migrations } from "meteor/percolate:migrations";
import * as collections from "/lib/collections";

Migrations.add({
  version: 56,
  up() {
    collections.Products.update(
      {
        type: "simple"
      },
      {
        $rename: { inventoryQuantity: "inventoryInStock" }
      },
      {
        multi: true
      }
    );

    collections.Products.update(
      {
        type: "variant"
      },
      {
        $rename: { inventoryQuantity: "inventoryInStock" }
      },
      {
        multi: true
      }
    );
  },
  down() {
    collections.Products.update(
      {
        type: "simple"
      },
      {
        $rename: { inventoryInStock: "inventoryQuantity" }
      },
      {
        multi: true
      }
    );
    collections.Products.update(
      {
        type: "variant"
      },
      {
        $rename: { inventoryInStock: "inventoryQuantity" }
      },
      {
        multi: true
      }
    );
  }
});
