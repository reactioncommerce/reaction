import { Meteor } from "meteor/meteor";
import { Hooks } from "/server/api";
import { Migrations } from "meteor/percolate:migrations";

Meteor.startup(() => {
  Migrations.config({
    // Log job run details to console
    log: false,
    logIfLatest: false
  });
});

Hooks.Events.add("afterCoreInit", () => {
  Migrations.migrateTo("latest");
});
