import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
import appEvents from "/imports/node-app/core/util/appEvents";

function reactionLogger(opts) {
  if (["warn", "info", "error"].includes(opts.level)) {
    Logger[opts.level](opts.message);
  }
}

Migrations.config({
  logger: reactionLogger,
  log: true,
  logIfLatest: false,
  collectionName: "Migrations"
});

appEvents.on("afterCoreInit", () => {
  const currentMigrationVersion = Migrations._getControl().version;
  const highestAvailableVersion = Migrations._list[Migrations._list.length - 1].version;

  // Checks to ensure the app is running against a DB at the right migration state. Running the app
  // with a wrong DB state will cause the app to malfunction
  if (currentMigrationVersion > highestAvailableVersion) {
    Logger.fatal(`You are running a Reaction install with migration version (${highestAvailableVersion}) below your current DB migration state (${currentMigrationVersion})`);
    Logger.fatal(`Upgrade to a version of Reaction containing migration ${currentMigrationVersion} or higher.`);
    Logger.fatal("If you really want to downgrade to this version, you should restore your DB to a previous state from your backup.");
    process.exit(0);
  } else if (!Meteor.isAppTest) {
    try {
      Migrations.migrateTo("latest");
    } catch (error) {
      Logger.error("Error while migrating", error);
      // Make sure the migration control record is unlocked so they can attempt to run again next time
      Migrations.unlock();
    }
  }
});
