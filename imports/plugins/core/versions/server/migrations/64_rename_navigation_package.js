import { Migrations } from "meteor/percolate:migrations";
import rawCollections from "/imports/collections/rawCollections";

const { Packages } = rawCollections;

Migrations.add({
  version: 64,
  up() {
    // Remove the old registry entry, the new one is called "reaction-navigation" and will be added
    // on app startup
    Packages.deleteMany({
      name: "navigation"
    });
  },
  down() {
    // Remove the old package. The old package was named "navigation" and will be added
    // on app startup
    Packages.deleteMany({
      name: "reaction-navigation"
    });
  }
});
