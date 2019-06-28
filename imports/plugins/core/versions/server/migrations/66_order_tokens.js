import { Migrations } from "meteor/percolate:migrations";
import { Orders } from "/lib/collections";
import { toArray, fromArray } from "../util/convert66";
import findAndConvertInBatches from "../util/findAndConvertInBatches";

Migrations.add({
  version: 66,
  up() {
    findAndConvertInBatches({ collection: Orders, converter: toArray });
  },
  down() {
    findAndConvertInBatches({ collection: Orders, converter: fromArray });
  }
});
