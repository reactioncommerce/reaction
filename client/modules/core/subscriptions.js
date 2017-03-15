import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { Session } from "meteor/session";
import { Tracker } from "meteor/tracker";
import { SubsManager } from "meteor/meteorhacks:subs-manager";

export const Subscriptions = {};

// Subscription Manager
// See: https://github.com/kadirahq/subs-manager
Subscriptions.Manager = new SubsManager();

Subscriptions.Account = Subscriptions.Manager.subscribe("Accounts", Meteor.userId());

/*
 * Reaction.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes `newSession`
 * Stores the server session id into local storage / cookies
 *
 * Also localStorage session could be set from the client-side. This could
 * happen when user flush browser's cache, for example.
 * @see https://github.com/reactioncommerce/reaction/issues/609#issuecomment-166389252
 */

/**
 * General Subscriptions
 */
Subscriptions.Shops = Subscriptions.Manager.subscribe("Shops");

Subscriptions.Packages = Subscriptions.Manager.subscribe("Packages");

Subscriptions.Tags = Subscriptions.Manager.subscribe("Tags");

Subscriptions.Media = Subscriptions.Manager.subscribe("Media");

/**
 * Subscriptions that need to reload on new sessions
 */
Tracker.autorun(function () {
  // we are trying to track both amplify and Session.get here, but the problem
  // is - we can't track amplify. It just not tracked. So, to track amplify we
  // are using dirty hack inside Accounts.loginWithAnonymous method.
  const sessionId = amplify.store("Reaction.session");
  let newSession;
  Tracker.nonreactive(() => {
    newSession = Random.id();
  });
  if (typeof sessionId !== "string") {
    amplify.store("Reaction.session", newSession);
    Session.set("sessionId", newSession);
  }
  if (typeof Session.get("sessionId") !== "string") {
    Session.set("sessionId", amplify.store("Reaction.session"));
  }
  Subscriptions.Sessions = Meteor.subscribe("Sessions", Session.get("sessionId"));
});

// @see http://guide.meteor.com/data-loading.html#changing-arguments
Tracker.autorun(() => {
  let sessionId;
  // we really don't need to track the sessionId here
  Tracker.nonreactive(() => {
    sessionId = Session.get("sessionId");
  });
  Subscriptions.Cart = Meteor.subscribe("Cart", sessionId, Meteor.userId());
  Subscriptions.UserProfile = Meteor.subscribe("UserProfile", Meteor.userId());
});
