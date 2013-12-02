// *****************************************************
// add subscriptions for reactivity
//
// *****************************************************
Meteor.subscribe("ReactionPackages");
ReactionConfigHandle = Meteor.subscribe("ReactionConfig");
Meteor.subscribe("UserConfig", Meteor.userId());

Meteor.subscribe(
  'ReactionSessions',
  amplify.store('reaction.session'), // Read from local storage / cookies
  function() {
    // The server returns only one record, so findOne will return that record
    var serverSession = new Meteor.Collection('ReactionSessions').findOne();
    // Stores into client session all data contained in server session;
    // supports reactivity when server changes the serverSession
    Session.set('serverSession', serverSession);
    // Stores the server session id into local storage / cookies
    amplify.store('reaction.session', serverSession._id);
  }
);