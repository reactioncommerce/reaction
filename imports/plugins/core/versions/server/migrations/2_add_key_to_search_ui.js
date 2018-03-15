import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";

// Add keys to search so that stock search is enabled by default
Migrations.add({
  version: 2,
  up() {
    if (Packages) {
      Packages.update(
        { name: "reaction-ui-search" },
        {
          $set: {
            registry: [
              {
                name: "Search Modal",
                provides: ["ui-search"],
                template: "searchModal"
              }
            ]
          }
        },
        { bypassCollection2: true, multi: true }
      );
    }
  }
});
