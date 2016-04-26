import Logger from "/client/modules/logger";

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
    let msg = "PackageRegistry: Insecure export to client.";
    Logger.warn(msg, PackageRegistry);
  }
  // init the core
  ReactionCore.init();
  // initialize anonymous guest users
  return Tracker.autorun(function () {
    const userId = Meteor.userId();
    // TODO: maybe `visibilityState` will be better here
    let isHidden;
    let guestAreAllowed;
    let loggingIn;
    let sessionId;
    Tracker.nonreactive(function () {
      guestAreAllowed = ReactionCore.allowGuestCheckout();
      isHidden = document[hidden];
      loggingIn = Accounts.loggingIn();
      sessionId = amplify.store("ReactionCore.session");
    });
    if (guestAreAllowed && !userId) {
      if (!isHidden && !loggingIn || typeof sessionId !== "string") {
        Accounts.loginWithAnonymous();
      }
    }
  });
});
