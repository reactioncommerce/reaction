import { Template } from "meteor/templating";
import Launchdock from "../../lib/launchdock";

/**
 * Checks to see if we have a valid connection to ld,
 * and currently assumes you don't have a launchdock account
 * rather than being some kind of status indicator (really should be both)
 */

Template.connectDashboard.onCreated(function () {
  this.subscribe("launchdock-auth");
});

Template.connectDashboard.helpers({
  ldConnection() {
    return Launchdock.connect();
  }
});


Template.connectSettings.onCreated(function () {
  this.subscribe("launchdock-auth");
});

Template.connectSettings.helpers({
  ldConnection() {
    return Launchdock.connect();
  }
});
