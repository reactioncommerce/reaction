/*
 * ReactionCore.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes the serverSession
 * Stores the server session id into local storage / cookies
 */

ReactionCore.Subscriptions.Sessions = Meteor.subscribe("Sessions",
  amplify.store("ReactionCore.session"),
  function () {
    let currentSession = Session.get("sessionId");
    if (!currentSession) {
      let serverSession = new Mongo.Collection("Sessions").findOne();
      amplify.store("ReactionCore.session", serverSession._id);
      return Session.set("sessionId", serverSession._id);
    }
    return currentSession;
  });

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
