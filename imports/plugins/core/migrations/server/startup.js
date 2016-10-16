import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Hooks, Logger } from "/server/api";
import { Migrations } from "meteor/percolate:migrations";

function reactionLogger(opts) {
  if (_.includes(["warn", "info", "error"], opts.level)) {
    Logger[opts.level](opts.message);
  }
}

Meteor.startup(() => {
  Migrations.config({
    logger: reactionLogger,
    log: false,
    logIfLatest: false
  });
});

Hooks.Events.add("afterCoreInit", () => {
  Migrations.migrateTo("latest");
});
