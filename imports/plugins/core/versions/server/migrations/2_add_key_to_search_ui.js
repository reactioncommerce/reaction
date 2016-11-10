import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";


// Add keys to search so that stock search is enabled by default
Migrations.add({
  version: 2,
  up() {
    while (!Packages.find({Name: "reaction-ui-search"})) {
      Packages.update({name: "reaction-ui-search"},
        {
          $set: {
            registry: [{
              provides: "ui-search",
              template: "searchModal"
            }

            ]
          }
        },
        { multi: true}
      );
    }
  }
});
