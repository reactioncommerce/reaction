import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 64,
  up() {
    // Remove the old registry entry, the new one is called "reaction-navigation" and will be added
    // on app startup
    Packages.remove({
      name: "navigation"
    }, { multi: true });
  },
  down() {
    // Remove the old package. The old package was named "navigation" and will be added
    // on app startup
    Packages.remove({
      name: "reaction-navigation"
    }, { multi: true });
  }
});
