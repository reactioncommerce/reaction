import { Hooks, Logger } from "/server/api";
import { Migrations } from "meteor/percolate:migrations";

Hooks.Events.add("afterCoreInit", () => {
  Logger.info("Adding Migration to afterCoreInit");
  Migrations.migrateTo("latest");
});
