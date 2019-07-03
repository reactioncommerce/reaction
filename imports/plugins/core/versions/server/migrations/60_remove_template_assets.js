import { Migrations } from "meteor/percolate:migrations";
import { Assets } from "/lib/collections";

/**
 * Remove all Asset docs with type "template". This avoids them being re-imported
 * into the Templates collection. Any assets that are still necessary will be added
 * back during startup.
 */
Migrations.add({
  version: 60,
  up() {
    Assets.remove({ type: "template" });
  }
});
