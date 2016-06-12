import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/api";
import Router from "./main";

Meteor.startup(function () {
  Tracker.autorun(function () {
    // initialize client routing
    if (Reaction.Subscriptions.Packages.ready() && Reaction.Subscriptions.Shops.ready()) {
      if (!Router._initialized) {
        Router.initPackageRoutes();
      }
    }
  });
});
