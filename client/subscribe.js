// *****************************************************
// add subscriptions for reactivity
//
// *****************************************************
Meteor.subscribe("ReactionPackages");
ReactionConfigHandle = Meteor.subscribe("ReactionConfig");
Meteor.subscribe("UserConfig", Meteor.userId());
