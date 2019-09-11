import { loadRegisteredBlocks, loadRegisteredComponents } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts } from "meteor/accounts-base";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Router } from "../lib";
import { initBrowserRouter } from "./browserRouter";

Meteor.startup(() => {
  loadRegisteredBlocks();
  loadRegisteredComponents();

  // Subscribe to router required publications
  // Note: Although these are subscribed to by the subscription manager in "/modules/client/core/subscriptions",
  // using the subscriptions manager sometimes causes issues when signing in/out where you may seee a grey screen
  // or missing shop data throughout the app.
  // TODO: Revisit subscriptions manager usage and waiting for shops to exist client side before rendering.
  const primaryShopSub = Meteor.subscribe("PrimaryShop");
  const packageSub = Meteor.subscribe("Packages");

  // initialize client routing
  Tracker.autorun((computation) => {
    // All of these are reactive
    const primaryShopSubIsReady = primaryShopSub.ready();
    const packageSubIsReady = packageSub.ready();
    const primaryShopId = Reaction.getPrimaryShopId();
    const hasShops = !!Shops.findOne();

    if (
      primaryShopSubIsReady &&
      packageSubIsReady &&
      primaryShopId &&
      hasShops
    ) {
      computation.stop();
      initBrowserRouter();
    }
  });

  //
  // we need to sometimes force
  // router reload on login to get
  // the entire layout to rerender
  // we only do this when the routes table
  // has already been generated (existing user)
  //
  Accounts.onLogin(() => {
    const shops = Shops.find({}).fetch();

    if (Meteor.loggingIn() === false && Router._routes.length > 0) {
      if (Array.isArray(shops) && shops.length) {
        initBrowserRouter();
      }
    }
  });
});
