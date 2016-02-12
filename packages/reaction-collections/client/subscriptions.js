/*
 * ReactionCore.session
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
ReactionCore.Subscriptions.Shops = ReactionSubscriptions.subscribe("Shops");

ReactionCore.Subscriptions.Packages = ReactionSubscriptions.subscribe("Packages");

ReactionCore.Subscriptions.Tags = ReactionSubscriptions.subscribe("Tags");

ReactionCore.Subscriptions.Media = ReactionSubscriptions.subscribe("Media");

// admin only
// todo should we put this inside autorun and detect user changes
ReactionCore.Subscriptions.Inventory = ReactionSubscriptions.subscribe("Inventory");

/**
 * Subscriptions that need to reload on new sessions
 */
Tracker.autorun(function () {
  // we are trying to track both amplify and Session.get here, but the problem
  // is - we can't track amplify. It just not tracked. So, to track amplify we
  // are using dirty hack inside Accounts.loginWithAnonymous method.
  const sessionId = amplify.store("ReactionCore.session");
  let newSession;
  Tracker.nonreactive(() => {
    newSession = Random.id();
  });
  if (typeof sessionId !== "string") {
    amplify.store("ReactionCore.session", newSession);
    Session.set("sessionId", newSession);
  }
  if (typeof Session.get("sessionId") !== "string") {
    Session.set("sessionId", amplify.store("ReactionCore.session"));
  }
  ReactionCore.Subscriptions.Sessions = ReactionSubscriptions.subscribe("Sessions",
    Session.get("sessionId"));
});

// @see http://guide.meteor.com/data-loading.html#changing-arguments
Tracker.autorun(() => {
  let sessionId;
  // we really don't need to track the sessionId here
  Tracker.nonreactive(() => {
    sessionId = Session.get("sessionId");
  });
  ReactionCore.Subscriptions.Cart = ReactionSubscriptions.subscribe("Cart",
    sessionId,
    Meteor.userId()
  );
});
