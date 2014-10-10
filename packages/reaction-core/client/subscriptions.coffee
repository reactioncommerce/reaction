###
# Create persistent sessions for users
# The server returns only one record, so findOne will return that record
# Stores into client session all data contained in server session
# supports reactivity when server changes the serverSession
# Stores the server session id into local storage / cookies
###
ReactionCore.Subscriptions.ReactionSessions = Meteor.subscribe "ReactionSessions", amplify.store("reaction.session"), ->
  serverSession = new Meteor.Collection("ReactionSessions").findOne()
  Session.set "serverSession", serverSession
  Session.set "sessionId", serverSession._id
  amplify.store "reaction.session", serverSession._id

###
# General Subscriptions
###
ReactionCore.Subscriptions.Packages = Meteor.subscribe "Packages"
ReactionCore.Subscriptions.ReactionConfig = Meteor.subscribe "ReactionConfig"
ReactionCore.Subscriptions.UserConfig = Meteor.subscribe "UserConfig", Meteor.userId()
ReactionCore.Subscriptions.orders = Meteor.subscribe "orders"
ReactionCore.Subscriptions.customers = Meteor.subscribe "customers"
ReactionCore.Subscriptions.tags = Meteor.subscribe "tags"
ReactionCore.Subscriptions.media = Meteor.subscribe "media"
ReactionCore.Subscriptions.FileStorage = Meteor.subscribe "FileStorage"
ReactionCore.Subscriptions.cart = Meteor.subscribe "cart", Session.get "sessionId"


###
#  Autorun dependencies
#  ensure user cart is created, and address located
###
Tracker.autorun ->
  unless (Session.get('address') or Meteor.user()?.profile.addressBook)
    #Setting Default because we get here before location calc
    address = {
      latitude: null,
      longitude: null,
      country: 'United States',
      city: null,
      state: null,
      stateCode: null,
      zipcode: null,
      streetName: null,
      streetNumber: null,
      countryCode: 'US'
    }
    Session.set("address",address)