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
  Migrations.migrateTo("latest");
});
