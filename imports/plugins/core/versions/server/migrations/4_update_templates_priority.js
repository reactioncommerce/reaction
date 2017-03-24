import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";

const query = { layout: { $type: 3 } }; // gets docs with layout objects

Migrations.add({
  version: 4,
  up() {
    const packages = Packages.find(query).fetch();
    const oldValue = 1;
    const newValue = 999;

    packages.forEach(updateHandler(oldValue, newValue));
  },
  down() {
    const packages = Packages.find(query).fetch();
    const oldValue = 999;
    const newValue = 1;

    packages.forEach(updateHandler(oldValue, newValue));
  }
});

function updateHandler(oldValue, newValue) {
  return function (pkg) {
    let changed = false; // to track if updating is needed
    pkg.layout.forEach((layout) => {
      if (layout.priority === oldValue) {
        layout.priority = newValue;
        changed = true;
      }
    });

    if (changed) {
      Packages.update(pkg._id, {
        $set: { layout: pkg.layout }
      });
    }
  };
}
