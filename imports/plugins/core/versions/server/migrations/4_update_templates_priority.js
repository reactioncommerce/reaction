import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api/";

Migrations.add({
  version: 4,
  up() {
    // grab only packages that have layout on them
    const packages = Packages.find({ layout: { $type: 3 } }).fetch();

    packages.forEach((pkg) => {
      pkg.layout.forEach((layout) => {
        if (layout.priority === 1) {
          layout.priority = 999;
        }
      });

      if (pkg.layout.length < 6) {
        Packages.update(pkg._id, {
          $set: { layout: pkg.layout }
        });
      }
    });

    Reaction.loadPackages();
    Reaction.Import.flush();
  }
});

