import { Migrations } from "/imports/plugins/core/versions";
import { Packages } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

// Add keys to search so that stock search is enabled by default
Migrations.add({
  version: 2,
  up() {
    Hooks.Events.add("afterCoreInit", () => {
      Logger.info("Running search package update");
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
    });
  }
});
