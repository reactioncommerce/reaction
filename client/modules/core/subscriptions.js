import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { SubsManager } from "meteor/meteorhacks:subs-manager";
import Reaction from "./main";
import { getUserId } from "./helpers/utils";

export const Subscriptions = {};

// Subscription Manager
// See: https://github.com/kadirahq/subs-manager
Subscriptions.Manager = new SubsManager();

/**
 * General Subscriptions
 */

Tracker.autorun(() => {
  const userId = getUserId();
  Subscriptions.Account = Subscriptions.Manager.subscribe("Accounts");
  Subscriptions.UserProfile = Meteor.subscribe("UserProfile", userId);
});

// Primary shop subscription
Subscriptions.PrimaryShop = Subscriptions.Manager.subscribe("PrimaryShop");

// Additional shop subscriptions
Subscriptions.MerchantShops = Subscriptions.Manager.subscribe("MerchantShops");

// This Packages subscription is used for the Active shop's packages
Subscriptions.Packages = Subscriptions.Manager.subscribe("Packages");

// This packages subscription is used for the Primary Shop's packages
// The Packages publication defaults to returning the primaryShopId's packages,
// so this subscription shouldn't ever need to be changed
// TODO: Consider how to handle routes for several shops which are all active at once
Subscriptions.PrimaryShopPackages = Subscriptions.Manager.subscribe("Packages");

Subscriptions.Groups = Subscriptions.Manager.subscribe("Groups");

Subscriptions.BrandAssets = Subscriptions.Manager.subscribe("BrandAssets");

Tracker.autorun(() => {
  // Reload Packages sub if shopId changes
  // We have a persistent subscription to the primary shop's packages,
  // so don't refresh sub if we're updating to primaryShopId sub
  const shopId = Reaction.getShopId();
  if (shopId && shopId !== Reaction.getPrimaryShopId()) {
    Subscriptions.Packages = Subscriptions.Manager.subscribe("Packages", shopId);
  }
});
