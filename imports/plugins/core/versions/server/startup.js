import { Meteor } from "meteor/meteor";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Migrations } from "meteor/percolate:migrations";

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

Hooks.Events.add("afterCoreInit", () => {
  const currentMigrationVersion = Migrations._getControl().version;
  const highestAvailableVersion = Migrations._list[Migrations._list.length - 1].version;

  if (currentMigrationVersion > highestAvailableVersion) {
    Logger.warn(`You are running a Reaction version with migration version (${highestAvailableVersion}) below your currrent DB migration state (${currentMigrationVersion})`);
    Migrations._setControl({ locked: false, version: highestAvailableVersion });
  } else {
    Migrations.migrateTo("latest");
  }
});
