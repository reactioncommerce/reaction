###
# Create persistent sessions for users
# The server returns only one record, so findOne will return that record
# Stores into client session all data contained in server session
# supports reactivity when server changes the serverSession
# Stores the server session id into local storage / cookies
###
ReactionCore.Subscriptions.Sessions = Meteor.subscribe "Sessions", amplify.store("ReactionCore.session"), ->
  serverSession = new Mongo.Collection("Sessions").findOne()
  Session.set "serverSession", serverSession
  Session.set "sessionId", serverSession._id
  amplify.store "ReactionCore.session", serverSession._id

  # subscribe to session dependant publications
  ReactionCore.Subscriptions.cart = Meteor.subscribe "cart", serverSession._id, Meteor.userId()
  ReactionCore.Subscriptions.account = Meteor.subscribe "accounts", serverSession._id, Meteor.userId()

  # ensure cart resubscribed when removed
  cart = ReactionCore.Collections.Cart.find('sessions': $in: [ serverSession._id ])
  handle = cart.observeChanges(
    removed: ->
      #console.log "detected cart destruction... resetting now."
      Meteor.subscribe "cart", serverSession._id, Meteor.userId()
      return
  )

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

###
# Autorun dependencies
###
# account address initialization
Tracker.autorun ->
  account = ReactionCore.Collections.Accounts.findOne()
  unless Session.get('address') or account?.profile?.addressBook
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
