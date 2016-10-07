import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import Logger from "/client/modules/logger";
import Reaction from "./main";

// @see https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
let hidden;
// let visibilityState; // keep this for a some case
if (typeof document.hidden !== "undefined") {
  hidden = "hidden";
  // visibilityState = "visibilityState";
} else if (typeof document.mozHidden !== "undefined") {
  hidden = "mozHidden";
  // visibilityState = "mozVisibilityState";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  // visibilityState = "msVisibilityState";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  // visibilityState = "webkitVisibilityState";
}

/**
 *  Startup Reaction
 *  Init Reaction client
 */
Meteor.startup(function () {
  // warn on insecure exporting of PackageRegistry settings
  if (typeof PackageRegistry !== "undefined" && PackageRegistry !== null) {
    const msg = "PackageRegistry: Insecure export to client.";
    Logger.warn(msg, PackageRegistry);
  }
  // init the core
  Reaction.init();
  // initialize anonymous guest users
  return Tracker.autorun(function () {
    const userId = Meteor.userId();
    // TODO: maybe `visibilityState` will be better here
    let isHidden;
    let loggingIn;
    let sessionId;
    Tracker.nonreactive(function () {
      isHidden = document[hidden];
      loggingIn = Accounts.loggingIn();
      sessionId = amplify.store("Reaction.session");
    });
    if (!userId) {
      if (!isHidden && !loggingIn || typeof sessionId !== "string") {
        Accounts.loginWithAnonymous();
      }
    }
  });
});
