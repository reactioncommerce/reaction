import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

const pkgs = [
  "reaction-accounts",
  "reaction-checkout",
  "reaction-dashboard",
  "reaction-email",
  "reaction-orders",
  "reaction-ui",
  "reaction-product-variant",
  "product-detail-simple",
  "core"
];

const query = {
  name: { $in: pkgs },
  layout: { $type: 3 } // docs with layouts set
};

Migrations.add({
  version: 18,
  up() {
    const packages = Packages.find(query).fetch();
    packages.forEach(updateHandler(
      { layoutHeader: "layoutHeader", layoutFooter: "layoutFooter" },
      { layoutHeader: "NavBar", layoutFooter: "Footer" }));
  },
  down() {
    const packages = Packages.find(query).fetch();
    packages.forEach(updateHandler(
      { layoutHeader: "NavBar", layoutFooter: "Footer" },
      { layoutHeader: "layoutHeader", layoutFooter: "layoutFooter" }));
  }
});

function updateHandler(oldValue, newValue) {
  return function (doc) {
    for (const layout of doc.layout) {
      if (layout.structure && layout.structure.layoutHeader === oldValue.layoutHeader) {
        layout.structure.layoutHeader = newValue.layoutHeader;
      }
      if (layout.structure && layout.structure.layoutFooter === oldValue.layoutFooter) {
        layout.structure.layoutFooter = newValue.layoutFooter;
      }
    }

    // Update whole document.
    // When not using validate: false, an error is thrown:
    // `When the modifier option is true, all validation object keys must be operators. Did you forget $set?`
    // https://github.com/aldeed/meteor-simple-schema/issues/175
    Packages.update(
      { _id: doc._id },
      doc,
      { validate: false });
  };
}
