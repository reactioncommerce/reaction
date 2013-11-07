// *****************************************************
// add subscriptions for reactivity
//
// *****************************************************
Meteor.subscribe("reaction_packages");
reactionConfigHandle = Meteor.subscribe("reaction_config");
Meteor.subscribe("user_config",Meteor.userId());
