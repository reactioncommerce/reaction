import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/modules/core";
import { ReactionRouter } from "/client/modules/router";

Meteor.startup(function () {
  Tracker.autorun(function () {
    // initialize client routing
    if (Reaction.Subscriptions.Packages.ready() && Reaction.Subscriptions.Shops.ready()) {
      if (!ReactionRouter._initialized) {
        ReactionRouter.initPackageRoutes();
      }
    }
  });
});
