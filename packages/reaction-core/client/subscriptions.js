/*
 * ReactionCore.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes the serverSession
 * Stores the server session id into local storage / cookies
 */
let currentSession;
let serverSession = Random.id();

Tracker.autorun(function () {
  currentSession = Session.get("sessionId") || amplify.store(
    "ReactionCore.session");
  if (!currentSession) {
    amplify.store("ReactionCore.session", serverSession);
    Session.set("sessionId", serverSession);
    currentSession = serverSession;
  }
});

ReactionCore.Subscriptions.Sessions = Meteor.subscribe("Sessions",
  currentSession);
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
ReactionCore.Subscriptions.Packages =
  Meteor.subscribe("Packages");

ReactionCore.Subscriptions.Tags =
  Meteor.subscribe("Tags");

ReactionCore.Subscriptions.Media =
  Meteor.subscribe("Media");
