import store from "store";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts as AccountsCollection } from "/lib/collections";
import { Accounts } from "meteor/accounts-base";

import { Reaction, Logger } from "/client/api";
import { userPrefs } from "./main";
import { getUserId } from "./helpers/utils";

/**
 *  Startup Reaction
 *  Init Reaction client
 */
Meteor.startup(() => {
  Reaction.init();
});

// Log in anonymous guest users
Tracker.autorun(() => {
  const userId = getUserId();
  if (userId) return; // This autorun is only for when we DO NOT have a user

  const loggingIn = Tracker.nonreactive(() => Accounts.loggingIn());
  if (loggingIn) return; // Already logging in

  // Get or generate a sessionId, saved in local storage, so that we can auto-login again next time.
  // Note that `store` package has cookie fallbacks for browsers without local storage, such as
  // Safari in incognito mode.
  let sessionId = store.get("Reaction.session");
  if (!sessionId) {
    sessionId = Random.id();
    store.set("Reaction.session", sessionId);
  }

  Accounts.callLoginMethod({
    methodArguments: [{
      anonymous: true,
      sessionId
    }]
  });
});

Tracker.autorun(() => {
  const userId = getUserId(); // The only reactive thing in this autorun. Reruns on login/logout only.
  if (!userId) return;

  // Load data from Accounts collection into the localStorage
  Tracker.nonreactive(() => {
    // Don't load the data from Accounts Collection again when something changes
    // as we are already storing everything in the localStorage reactively
    try {
      const user = AccountsCollection.findOne(userId);
      if (user && user.profile && user.profile.preferences) {
        Object.keys(user.profile.preferences).forEach((packageName) => {
          const packageSettings = user.profile.preferences[packageName];
          Object.keys(packageSettings).forEach((preference) => {
            if (packageName === "reaction" && preference === "activeShopId") {
              // Because activeShopId is cached on client side.
              Reaction.setShopId(packageSettings[preference]);
            } else {
              Reaction.setUserPreferences(packageName, preference, packageSettings[preference]);
            }
          });
        });
      }
    } catch (err) {
      Logger.error("Problem in loading user preferences from Accounts collection");
    }
  });
});

// Fine-grained reactivity on only the user preferences
Tracker.autorun(() => {
  const userId = getUserId();
  if (!userId) return;

  const user = Meteor.users.findOne(userId, { fields: { profile: 1 } });
  userPrefs.set((user && user.profile && user.profile.preferences) || undefined);
});
