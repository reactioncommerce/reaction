import { Migrations } from "meteor/percolate:migrations";
import { Tags } from "/lib/collections";

Migrations.add({
  version: 6,
  up() {
    Tags.update({}, {
      $set: {
        isVisible: true
      }
    }, { multi: true });
  },
  down() {
    Tags.update({}, {
      $unset: {
        isVisible: null
      }
    }, { multi: true });
  }
});
