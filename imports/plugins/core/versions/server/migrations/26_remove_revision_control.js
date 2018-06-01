import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

// Migration file created for removing the revision control package registry entry from all shops
Migrations.add({
  version: 26,
  up() {
    Packages.remove({
      name: "reaction-revisions"
    });
  }
});
