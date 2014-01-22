# *****************************************************
# add subscriptions for reactivity
#
# *****************************************************
Meteor.subscribe "ReactionPackages"
ReactionConfigHandle = Meteor.subscribe("ReactionConfig")
Meteor.subscribe "UserConfig", Meteor.userId()
# Read from local storage / cookies
Meteor.subscribe "ReactionSessions", amplify.store("reaction.session"), ->
  # The server returns only one record, so findOne will return that record
  serverSession = new Meteor.Collection("ReactionSessions").findOne()
  # Stores into client session all data contained in server session;
  # supports reactivity when server changes the serverSession
  Session.set "serverSession", serverSession
  # Stores the server session id into local storage / cookies
  amplify.store "reaction.session", serverSession._id
