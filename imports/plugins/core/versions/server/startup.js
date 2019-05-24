import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
import appEvents from "/imports/node-app/core/util/appEvents";
import config from "/imports/node-app/core/config";


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

appEvents.on("readyForMigrations", () => {
  const currentMigrationVersion = Migrations._getControl().version;
  const highestAvailableVersion = Migrations._list[Migrations._list.length - 1].version;

  if (config.MIGRATION_BYPASS_ENABLED) {
    Logger.warn("DANGER: MIGRATION_BYPASS_ENABLED is true and all migration activity is bypassed. This is a dangerous mode and may result in data corruption.");
    if (currentMigrationVersion > highestAvailableVersion) {
      Logger.warn(`You are running a Reaction install with migration version (${highestAvailableVersion}) below your current DB migration state (${currentMigrationVersion})`);
      Logger.warn(`Upgrade to a version of Reaction containing migration ${currentMigrationVersion} or higher.`);
      Logger.warn("If you really want to downgrade to this version, you should restore your DB to a previous state from your backup.");
    }
  } else {
    // Checks to ensure the app is running against a DB at the right migration state. Running the app
    // with a wrong DB state will cause the app to malfunction
    if (currentMigrationVersion > highestAvailableVersion) {
      Logger.fatal(`You are running a Reaction install with migration version (${highestAvailableVersion}) below your current DB migration state (${currentMigrationVersion})`);
      Logger.fatal(`Upgrade to a version of Reaction containing migration ${currentMigrationVersion} or higher.`);
      Logger.fatal("If you really want to downgrade to this version, you should restore your DB to a previous state from your backup.");
      process.exit(0);
    }

    if (!Meteor.isAppTest) {
      try {
        Migrations.migrateTo("latest");
      } catch (error) {
        Logger.error("Error while migrating", error);
        // Make sure the migration control record is unlocked so they can attempt to run again next time
        Migrations.unlock();
      }
    }
  }
});
