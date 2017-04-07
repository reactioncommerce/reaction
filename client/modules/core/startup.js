import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import Reaction from "./main";

/**
 *  Startup Reaction
 *  Init Reaction client
 */
Meteor.startup(function () {
  // init the core
  Reaction.init();
  // initialize anonymous guest users
  return Tracker.autorun(function () {
    const userId = Meteor.userId();
    // TODO: maybe `visibilityState` will be better here
    let loggingIn;
    let sessionId;
    Tracker.nonreactive(function () {
      loggingIn = Accounts.loggingIn();
      sessionId = amplify.store("Reaction.session");
    });
    if (!userId) {
      if (!loggingIn || typeof sessionId !== "string") {
        Accounts.loginWithAnonymous();
      }
    }
  });
});
