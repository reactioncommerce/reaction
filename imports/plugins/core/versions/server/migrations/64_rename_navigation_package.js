import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

Migrations.add({
  version: 64,
  up() {
    const { Packages } = rawCollections;

    // Remove the old registry entry, the new one is called "reaction-navigation" and will be added
    // on app startup
    Packages.deleteMany({
      name: "navigation"
    });
  },
  down() {
    const { Packages } = rawCollections;

    // Remove the old package. The old package was named "navigation" and will be added
    // on app startup
    Packages.deleteMany({
      name: "reaction-navigation"
    });
  }
});
