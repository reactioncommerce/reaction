import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/modules/core";

Meteor.startup(function () {
  Tracker.autorun(function () {
    // initialize client routing
    if (Reaction.Subscriptions.Packages.ready() && Reaction.Subscriptions.Shops.ready()) {
      ReactionRouter.initPackageRoutes();
    }
  });
});
