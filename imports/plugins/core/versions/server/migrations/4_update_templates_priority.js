import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 4,
  up() {
    // grab only packages that have layout on them
    const packages = Packages.find({ layout: { $type: 3 } }).fetch();

    packages.forEach((pkg) => {
      let changed = false; // to track if updating is needed

      pkg.layout.forEach((layout) => {
        if (layout.priority === 1) {
          layout.priority = 999;
          changed = true;
        }
      });

      if (changed) {
        Packages.update(pkg._id, {
          $set: { layout: pkg.layout }
        });
      }
    });
  }
});

