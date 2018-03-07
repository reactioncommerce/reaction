import { Migrations } from "meteor/percolate:migrations";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api/";
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
