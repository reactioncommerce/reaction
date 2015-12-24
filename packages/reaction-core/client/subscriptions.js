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

Tracker.autorun(function () {
  if (typeof amplify.store("ReactionCore.session") !== "string") {
    const newSession = Random.id();
    amplify.store("ReactionCore.session", newSession);
    Session.set("sessionId", newSession);
  }
  if (typeof Session.get("sessionId") !== "string") {
    Session.set("sessionId", amplify.store("ReactionCore.session"));
  }
  ReactionCore.Subscriptions.Sessions = Meteor.subscribe("Sessions",
    Session.get("sessionId"));
});

// todo maybe we need to move cart subscription inside above autorun?
// maybe this is the reason
// why https://github.com/reactioncommerce/reaction/issues/536 happens?
// Load order is important here, sessions come before cart.
ReactionCore.Subscriptions.Cart = Meteor.subscribe("Cart",
  Session.get("sessionId"),
  Meteor.userId()
);
// detect when a cart has been deleted
// resubscribe will force cart to be rebuilt
let cart = ReactionCore.Collections.Cart.find();
cart.observeChanges({
  removed: function () {
    Meteor.subscribe("Cart", Session.get("sessionId"), Meteor.userId());
  }
});

/**
 * General Subscriptions
 */
ReactionCore.Subscriptions.Packages = Meteor.subscribe("Packages");

ReactionCore.Subscriptions.Tags = Meteor.subscribe("Tags");

ReactionCore.Subscriptions.Media = Meteor.subscribe("Media");

// admin only

ReactionCore.Subscriptions.Inventory = Meteor.subscribe("Inventory");
