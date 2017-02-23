import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api/";
// Add keys to search so that stock search is enabled by default
Migrations.add({
  version: 3,
  up() {
    Packages.update({},
      {
        $set: {
          registry: []
        }
      },
      { multi: true }
    );
    Reaction.loadPackages();
    Reaction.Import.flush();
  }
});
