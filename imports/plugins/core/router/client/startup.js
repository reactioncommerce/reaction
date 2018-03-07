import { loadRegisteredComponents } from "@reactioncommerce/reaction-components";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts } from "meteor/accounts-base";
import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Router } from "../lib";
import { initBrowserRouter } from "./browserRouter";

Meteor.startup(() => {
  loadRegisteredComponents();

  // Subscribe to router required publications
  // Note: Although these are subscribed to by the subscription manager in "/modules/client/core/subscriptions",
  // using the subscriptions manager sometimes causes issues when signing in/out where you may seee a grey screen
  // or missing shop data throughout the app.
  // TODO: Revisit subscriptions manager usage and waiting for shops to exist client side before rendering.
  const primaryShopSub = Meteor.subscribe("PrimaryShop");
  const merchantShopSub = Meteor.subscribe("MerchantShops");
  const packageSub = Meteor.subscribe("Packages");

  let isLoaded = false;

  Tracker.autorun(() => {
    // initialize client routing
    if (
      primaryShopSub.ready() &&
      merchantShopSub.ready() &&
      packageSub.ready() &&
      // In addition to the subscriptions, shopId must be defined before we proceed
      // to avoid conditions where the subscriptions may be ready, but the cached
      // shopId has yet been set.
      // Reaction.primaryShopId is a reactive data source
      Reaction.primaryShopId !== null
    ) {
      const shops = Shops.find({}).fetch();
      //  initBrowserRouter calls Router.initPackageRoutes which calls shopSub.ready which is reactive,
      //  So we have to call initBrowserRouter in a non reactive context.
      //  Otherwise initBrowserRouter is called twice each time a subscription becomes "ready"
      Tracker.nonreactive(() => {
        // Make sure we have shops before we try to make routes for them
        if (Array.isArray(shops) && shops.length) {
          if (!isLoaded) {
            isLoaded = true;
            initBrowserRouter();
          }
        }
      });
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
