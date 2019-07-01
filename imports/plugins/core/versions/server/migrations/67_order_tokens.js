import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";
import { toArray, fromArray } from "../util/convert67";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 67,
  up() {
    findAndConvertInBatches({ collection: Orders, converter: toArray });
  },
  down() {
    findAndConvertInBatches({ collection: Orders, converter: fromArray });
  }
});
