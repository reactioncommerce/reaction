import Logger from "/client/modules/logger";
import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { Tracker } from "meteor/tracker";
import { SubsManager } from "meteor/meteorhacks:subs-manager";
import { Roles } from "meteor/alanning:roles";
import { Accounts } from "/lib/collections";
import Reaction from "./main";
import { getUserId } from "./helpers/utils";
import { getAnonymousCartsReactive, unstoreAnonymousCart } from "/imports/plugins/core/cart/client/util/anonymousCarts";

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

Subscriptions.Tags = Subscriptions.Manager.subscribe("Tags");

Subscriptions.Groups = Subscriptions.Manager.subscribe("Groups");

Subscriptions.BrandAssets = Subscriptions.Manager.subscribe("BrandAssets");

const cartSubCreated = new ReactiveVar(false);
Tracker.autorun(() => {
  const userId = getUserId();
  if (!userId) return;

  const account = Accounts.findOne({ userId });
  const anonymousCarts = getAnonymousCartsReactive();
  Subscriptions.Cart = Subscriptions.Manager.subscribe("Cart", account && account._id, anonymousCarts);
  cartSubCreated.set(true);
});

/**
 * @summary Wraps mergeCart method with a Promise
 * @private
 * @param {String} _id ID of an anonymous cart
 * @param {String} token Token for this anonymous cart
 * @returns {Promise} Undefined
 */
function mergeCart(_id, token) {
  return new Promise((resolve, reject) => {
    Meteor.call("cart/mergeCart", _id, token, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

// If ever we end up being logged in but also having an anonymous cart,
// call the mergeCart function to merge it into an account cart and destroy
let isMerging = false;
Tracker.autorun(() => {
  const userId = getUserId();
  if (!userId) return;

  const shopId = Reaction.getCartShopId();
  if (!shopId) return; // could be waiting for subscription

  const isAnonymousUser = Roles.userIsInRole(userId, "anonymous", shopId);
  if (!isAnonymousUser && cartSubCreated.get() && Subscriptions.Cart.ready() && !isMerging) {
    const anonymousCarts = getAnonymousCartsReactive();

    if (anonymousCarts && anonymousCarts.length) {
      isMerging = true;

      const promises = anonymousCarts.map(({ _id, token }) => (
        mergeCart(_id, token)
          .then(() => {
            unstoreAnonymousCart(_id);
            return null;
          })
          .catch((error) => {
            // If we have cached an anonymous cart ID that no longer exists, we can just remove it
            if (error.message && error.message.includes("Anonymous cart not found")) {
              unstoreAnonymousCart(_id);
            } else {
              Logger.error(error.message);
            }
          })
      ));

      Promise.all(promises)
        .then(() => {
          isMerging = false;
          return null;
        })
        .catch(() => {
          isMerging = false;
        });
    }
  }
});

Tracker.autorun(() => {
  // Reload Packages sub if shopId changes
  // We have a persistent subscription to the primary shop's packages,
  // so don't refresh sub if we're updating to primaryShopId sub
  const shopId = Reaction.getShopId();
  if (shopId && shopId !== Reaction.getPrimaryShopId()) {
    Subscriptions.Packages = Subscriptions.Manager.subscribe("Packages", shopId);
  }
});
