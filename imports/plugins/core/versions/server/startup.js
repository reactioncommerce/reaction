import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Migrations } from "meteor/percolate:migrations";
import appEvents from "/imports/node-app/core/util/appEvents";
import config from "/imports/node-app/core/config";

/**
 * @param {Object} opts Logger options
 * @returns {undefined}
 */
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
  const highestAvailableVersion = Migrations._list[Migrations._list.length - 1].version;

  // If this is a fresh database, as indicated by the migration control document not yet
  // existing, create the control record and assume that we're already at the latest
  // DB version.
  let controlDoc = Migrations._collection.findOne({ _id: "control" });
  if (!controlDoc) {
    try {
      Migrations._collection.insert({
        _id: "control",
        locked: false,
        version: highestAvailableVersion
      });
      controlDoc = Migrations._collection.findOne({ _id: "control" });
    } catch (error) {
      // If multiple instances are starting at the same time, it's possible we'll get an
      // error here because another already inserted the control doc just now. Ignore the
      // error if that is the case.
      const controlDocRecheck = Migrations._collection.findOne({ _id: "control" });
      if (!controlDocRecheck) {
        Logger.error(error, "Failed to insert migration control document");
      }
    }
  }

  const currentMigrationVersion = controlDoc ? controlDoc.version : 0;

  if (config.MIGRATION_BYPASS_ENABLED) {
    Logger.warn("DANGER: MIGRATION_BYPASS_ENABLED is true and all migration activity is bypassed. This is a dangerous mode and may result in data corruption.");
    if (currentMigrationVersion > highestAvailableVersion) {
      Logger.warn(`You are running a Reaction install with migration version (${highestAvailableVersion})` +
        ` below your current DB migration state (${currentMigrationVersion})`);
      Logger.warn(`Upgrade to a version of Reaction containing migration ${currentMigrationVersion} or higher.`);
      Logger.warn("If you really want to downgrade to this version, you should restore your DB to a previous state from your backup.");
    }
  } else {
    // Checks to ensure the app is running against a DB at the right migration state. Running the app
    // with a wrong DB state will cause the app to malfunction
    if (currentMigrationVersion > highestAvailableVersion) {
      Logger.fatal(`You are running a Reaction install with migration version (${highestAvailableVersion})` +
        ` below your current DB migration state (${currentMigrationVersion})`);
      Logger.fatal(`Upgrade to a version of Reaction containing migration ${currentMigrationVersion} or higher.`);
      Logger.fatal("If you really want to downgrade to this version, you should restore your DB to a previous state from your backup.");
      // eslint-disable-next-line no-process-exit
      process.exit(0);
    }

    if (!Meteor.isAppTest) {
      try {
        Migrations.migrateTo("latest");
      } catch (error) {
        Logger.error("Error while migrating", error);
        // Make sure the migration control record is unlocked so they can attempt to run again next time
        Migrations._collection.update({ _id: "control" }, { $set: { locked: false } });
      }
    }
  }
});
