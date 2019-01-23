import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { isAppStartupComplete } from "imports/plugins/core/core/server/startup/startNodeApp";

before(function (done) {
  this.timeout(30000);
  let readyToBeginRunningTests = isAppStartupComplete();
  while (!readyToBeginRunningTests) {
    readyToBeginRunningTests = isAppStartupComplete();
    Logger.info("Waiting for app to finish starting before running tests...");
    Meteor._sleepForMs(1000);
  }
  done();
});
