###
# Create persistent sessions for users
# The server returns only one record, so findOne will return that record
# Stores into client session all data contained in server session
# supports reactivity when server changes the serverSession
# Stores the server session id into local storage / cookies
###
Meteor.subscribe "ReactionSessions", amplify.store("reaction.session"), ->
  serverSession = new Meteor.Collection("ReactionSessions").findOne()
  Session.set "serverSession", serverSession
  Session.set "sessionId", serverSession._id
  amplify.store "reaction.session", serverSession._id

###
# General Subscriptions
###
PackagesHandle = @PackagesHandle = Meteor.subscribe("Packages")
ReactionConfigHandle = Meteor.subscribe "ReactionConfig"
share.ConfigDataHandle = Meteor.subscribe 'ConfigData'

Meteor.subscribe "UserConfig", Meteor.userId()
Meteor.subscribe "orders"
Meteor.subscribe "customers"
Meteor.subscribe "tags"
Meteor.subscribe "media"
Meteor.subscribe "FileStorage"
Meteor.subscribe "Packages"
Meteor.subscribe "cart", Session.get "sessionId"

###
#  Autorun dependencies
#  ensure user cart is created, and address located
###
Deps.autorun ->
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