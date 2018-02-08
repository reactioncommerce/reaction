import { Migrations } from "meteor/percolate:migrations";
import { Shops, Packages } from "/lib/collections";

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
    packages.forEach(updateHandler(Packages));

    const shops = Shops.find().fetch();
    shops.forEach(updateHandler(Shops));
  },
  down() {
    const packages = Packages.find(query).fetch();
    packages.forEach(downgradeHandler(Packages));

    const shops = Shops.find().fetch();
    shops.forEach(downgradeHandler(Shops));
  }
});

function updateHandler(collection) {
  return function (doc) {
    let changed = false;
    for (const layout of doc.layout) {
      if (layout.structure && layout.structure.template === "cartCheckout") {
        layout.structure.layoutHeader = "NavBarCheckout";
        changed = true;
      } else if (layout.structure && layout.structure.layoutHeader === "layoutHeader") {
        layout.structure.layoutHeader = "NavBar";
        changed = true;
      }
      if (layout.structure && layout.structure.layoutFooter === "layoutFooter") {
        layout.structure.layoutFooter = "Footer";
        changed = true;
      }
    }

    if (changed) {
      collection.update({ _id: doc._id }, {
        $set: { layout: doc.layout }
      });
    }
  };
}

function downgradeHandler(collection) {
  return function (doc) {
    let changed = false;
    for (const layout of doc.layout) {
      if (layout.structure && layout.structure.layoutHeader === "NavBar") {
        layout.structure.layoutHeader = "layoutHeader";
        changed = true;
      }
      if (layout.structure && layout.structure.layoutFooter === "Footer") {
        layout.structure.layoutFooter = "layoutFooter";
        changed = true;
      }
    }

    if (changed) {
      collection.update({ _id: doc._id }, {
        $set: { layout: doc.layout }
      });
    }
  };
}
