import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import migrate from "migrate";

function reactionLogger(opts) {
  if (["warn", "info", "error"].includes(opts.level)) {
    Logger[opts.level](opts.message);
  }
}

Hooks.Events.add("afterCoreInit", () => {
  migrate.load({
    stateStore: '/Users/akarshitwal/Documents/reaction/imports/plugins/core/versions/.migrate',
    migrationsDirectory: "/Users/akarshitwal/Documents/reaction/imports/plugins/core/versions/server/migrations",
    sortFunction,
    ignoreMissing: false,
    filterFunction
  }, function (error, set) {
    if (error) {
      Logger.error(error, "Migrations loading successful failed");
      console.log(error);
    }
    console.log("Set", set);
    // migrate to the latest version
    set.up(function (err) {
      if (err) {
        Logger.error(error, "Migration to latest version failed");
      }
      Logger.info("Migration to latest version successful");
    })
  });
});

// This function sorts the files 1_*, 2_*, ....
function sortFunction(title1, title2) {
  return Number(title1.substr(0, title1.indexOf("_"))) - Number(title2.substr(0, title2.indexOf("_")));
}

// This filters all the files that don't have an _
// And for now only allows the first migration through
function filterFunction(title) {
  // console.log(title, Number(title.substr(title.indexOf("_"))));
  if (title.indexOf("_") > -1 && Number(title.substr(0, title.indexOf("_"))) < 2) {
    return true;
  }
  return false;
}