import _ from "lodash";
import { Hooks, Logger } from "/server/api";
import { Migrations } from "./migrations";

function reactionLogger(opts) {
  if (_.includes(["warn", "info", "error"], opts.level)) {
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
