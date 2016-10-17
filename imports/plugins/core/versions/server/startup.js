import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Hooks, Logger } from "/server/api";
import { Versions } from "/imports/plugins/core/versions";

function reactionLogger(opts) {
  if (_.includes(["warn", "info", "error"], opts.level)) {
    Logger[opts.level](opts.message);
  }
}

Meteor.startup(() => {
  Versions.config({
    logger: reactionLogger,
    log: false,
    logIfLatest: false
  });
});

Hooks.Events.add("afterCoreInit", () => {
  Versions.migrateTo("latest");
});
