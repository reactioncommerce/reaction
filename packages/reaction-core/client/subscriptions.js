
/*
 * ReactionCore.session
 * Create persistent sessions for users
 * The server returns only one record, so findOne will return that record
 * Stores into client session all data contained in server session
 * supports reactivity when server changes the serverSession
 * Stores the server session id into local storage / cookies
 */


  var cart, handle;

  ReactionCore.Subscriptions.Account = Meteor.subscribe("Accounts", Meteor.userId());

  ReactionCore.Subscriptions.Cart = Meteor.subscribe("Cart", Meteor.userId());

  ReactionCore.Subscriptions.Sessions = Meteor.subscribe("Sessions", amplify.store("ReactionCore.session"), function() {
    var serverSession;
    serverSession = new Mongo.Collection("Sessions").findOne();
    return amplify.store("ReactionCore.session", serverSession._id);
  });

  cart = ReactionCore.Collections.Cart.find({
    userId: Meteor.userId()
  });

  handle = cart.observeChanges({
    removed: function() {
      ReactionCore.Events.debug("detected cart destruction... resetting now.");
      Meteor.subscribe("Cart", Meteor.userId());
    }
  });


  /**
   * Subscriptions
   */

  ReactionCore.Subscriptions.Packages = Meteor.subscribe("Packages");

  ReactionCore.Subscriptions.Orders = Meteor.subscribe("Orders");

  ReactionCore.Subscriptions.Tags = Meteor.subscribe("Tags");

  ReactionCore.Subscriptions.Media = Meteor.subscribe("Media");
