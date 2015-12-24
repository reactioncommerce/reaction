/*
 * ReactionCore.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes the serverSession
 * Stores the server session id into local storage / cookies
 */

Tracker.autorun(function () {
  if (typeof amplify.store("ReactionCore.session") !== "string") {
    const serverSession = Random.id();
    amplify.store("ReactionCore.session", serverSession);
    Session.set("sessionId", serverSession);
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
  Session.get("sessionId")
);
// detect when a cart has been deleted
// resubscribe will force cart to be rebuilt
let cart = ReactionCore.Collections.Cart.find();
cart.observeChanges({
  removed: function () {
    Meteor.subscribe("Cart", Session.get("sessionId"));
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
