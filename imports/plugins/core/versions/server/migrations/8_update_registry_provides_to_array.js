import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

Migrations.add({
  version: 8,
  up() {
    const packages = Packages.find();
    // Loop through all packages and update provides to use an array
    packages.forEach((pkg) => {
      if (pkg.registry) {
        // Map the existing registry into an updated registry with the existing "provides" string wrapped in an array
        // We use the term "app" to refer to individual registry entries
        const updatedRegistry = pkg.registry.map((app) => {
          if (typeof app.provides === "string") {
            app.provides = [app.provides];
          }
          return app;
        });

        // Update the package document with the new registry
        Packages.update({ _id: pkg._id }, {
          $set: {
            registry: updatedRegistry
          }
        }, { bypassCollection2: true });
      }
    });
  },

  down() {
    const packages = Packages.find();

    // Loop through all packages and update provides to use an array
    packages.forEach((pkg) => {
      if (pkg.registry) {
        // Map the existing registry into an updated registry with any provides arrays changed to use the first element
        // of the array. We discussed reducing the array and creating an entry for each provides here, but felt that
        // since versions of the app before this would have only had one entry, it's safer to just take the first element
        // of the array
        const updatedRegistry = pkg.registry.map((entry) => {
          if (Array.isArray(entry.provides)) {
            entry.provides = entry.provides[0]; // eslint-disable-line prefer-destructuring
          }
          return entry;
        });

        // Update the package document with the new registry
        Packages.update({ _id: pkg._id }, {
          $set: {
            registry: updatedRegistry
          }
        }, { bypassCollection2: true });
      }
    });
  }
});
