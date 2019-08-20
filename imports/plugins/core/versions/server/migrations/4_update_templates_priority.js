/* eslint-disable require-jsdoc */
import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

const reactionPkgs = [ // reaction packages with layouts
  "reaction-accounts",
  "reaction-checkout",
  "reaction-dashboard",
  "reaction-email",
  "reaction-orders",
  "reaction-ui",
  "reaction-inventory",
  "reaction-product-variant"];

const query = {
  name: { $in: reactionPkgs },
  layout: { $type: 3 } // docs with layouts set
};

Migrations.add({
  version: 4,
  up() {
    const packages = Packages.find(query).fetch();
    packages.forEach(updateHandler(1, 999));
  },
  down() {
    const packages = Packages.find(query).fetch();
    packages.forEach(updateHandler(999, 1));
  }
});

function updateHandler(oldValue, newValue) {
  return function (pkg) {
    let changed = false; // to track if updating is needed
    pkg.layout.forEach((layout) => {
      if (!layout.priority || layout.priority === oldValue) {
        layout.priority = newValue;
        changed = true;
      }
    });

    if (changed) {
      Packages.update(pkg._id, {
        $set: { layout: pkg.layout }
      }, { bypassCollection2: true });
    }
  };
}
