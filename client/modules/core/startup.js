import store from "amplify-store";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Accounts } from "meteor/accounts-base";

import { Reaction, Logger } from "/client/api";
import { userPrefs } from "./main";

const cookieName = "_RcFallbackLoginToken";

/**
 *  Startup Reaction
 *  Init Reaction client
 */
Meteor.startup(function () {
  // init the core
  Reaction.init();

  // initialize anonymous guest users
  Tracker.autorun(function () {
    const userId = Meteor.userId();

    if (userId && !isLocalStorageAvailable() && !readCookie(cookieName)) {
      Logger.debug("No local storage available. About to set up fallback login " +
        "mechanism with cookie login token.");
      Meteor.call("accounts/createFallbackLoginToken", (err, token) => {
        if (!err && token) {
          window.onbeforeunload = () => createSessionCookie(cookieName, token);
          return;
        }
        // Can't set login cookie. Fail silently.
        Logger.error("Setting up fallback login mechanism failed!");
      });
    }

    // TODO: maybe `visibilityState` will be better here
    let loggingIn;
    let sessionId;
    Tracker.nonreactive(function () {
      loggingIn = Accounts.loggingIn();
      sessionId = store("Reaction.session");
    });

    if (!userId) {
      if (!loggingIn || typeof sessionId !== "string") {
        if (!isLocalStorageAvailable() && readCookie(cookieName)) {
          // If re-login through local storage fails, RC falls back
          // to cookie-based login. E.g. Applies for Safari browser in
          // incognito mode.
          Accounts.loginWithToken(readCookie(cookieName));
        } else {
          Accounts.loginWithAnonymous();
        }
      }
    }
  });

  // Set up an autorun to get fine-grained reactivity on only the
  // user preferences
  Tracker.autorun(function () {
    const userId = Meteor.userId();
    if (!userId) return;
    const user = Meteor.users.findOne(userId, { fields: { profile: 1 } });
    userPrefs.set(user && user.profile && user.profile.preferences || undefined);
  });
});

function isLocalStorageAvailable() {
  try {
    localStorage.testKey = "testValue";
  } catch (e) {
    return false;
  }
  delete localStorage.testKey;
  return true;
}

function readCookie(name) {
  const nameEq = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEq) === 0) {
      return c.substring(nameEq.length, c.length);
    }
  }
  return null;
}

function createSessionCookie(name, value) {
  document.cookie = name + "=" + value + "; path=/";
}
