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
  function() {
    let serverSession = new Mongo.Collection("Sessions").findOne();
    return amplify.store("ReactionCore.session", serverSession._id);
  });

let sessionId = amplify.store("ReactionCore.session");

// Load order is important here, sessions come before cart.
ReactionCore.Subscriptions.Cart = Meteor.subscribe("Cart",
  sessionId,
  Meteor.userId()
);

// monitoring userId or sessionId changes
let cart = ReactionCore.Collections.Cart.find({
  userId: Meteor.userId(),
  sessionid: sessionId
});

// detect when a cart has been deleted
// resubscribe will force cart to be rebuilt
cart.observeChanges({
  removed: function() {
    Meteor.subscribe("Cart", sessionId, Meteor.userId());
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
