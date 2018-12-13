import { Migrations } from "meteor/percolate:migrations";
import { Tags } from "/lib/collections";

/**
 * @file
 * Sets isActive on all existing Tags to true
 */

Migrations.add({
  version: 50,
  up() {
    Tags.rawCollection().update({}, {
      $set: {
        isActive: true
      }
    }, {
      multi: true
    });
  },
  down() {
    Tags.rawCollection().update({}, {
      $set: {
        isActive: ""
      }
    }, {
      multi: true
    });
  }
});

