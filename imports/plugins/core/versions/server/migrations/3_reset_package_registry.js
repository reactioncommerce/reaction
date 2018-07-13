import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
// Add keys to search so that stock search is enabled by default
Migrations.add({
  version: 3,
  up() {
    Packages.update(
      {}, {
        $set: {
          registry: []
        }
      },
      { bypassCollection2: true, multi: true }
    );
    Reaction.loadPackages();
    Reaction.Importer.flush();
  }
});
