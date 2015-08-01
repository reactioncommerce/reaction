###
# Create persistent sessions for users
# The server returns only one record, so findOne will return that record
# Stores into client session all data contained in server session
# supports reactivity when server changes the serverSession
# Stores the server session id into local storage / cookies
###

ReactionCore.Subscriptions.Account = Meteor.subscribe "Accounts", Meteor.userId()
ReactionCore.Subscriptions.Cart = Meteor.subscribe "Cart", Meteor.userId()

ReactionCore.Subscriptions.Sessions = Meteor.subscribe "Sessions", amplify.store("ReactionCore.session"), ->
  serverSession = new Mongo.Collection("Sessions").findOne()
  amplify.store "ReactionCore.session", serverSession._id

#ensure cart resubscribed when removed
cart = ReactionCore.Collections.Cart.find userId: Meteor.userId()
handle = cart.observeChanges(
  removed: ->
    ReactionCore.Events.debug "detected cart destruction... resetting now."
    Meteor.subscribe "Cart", Meteor.userId()
    return
)

###
# General Subscriptions
###
ReactionCore.Subscriptions.Packages = Meteor.subscribe "Packages"
ReactionCore.Subscriptions.Orders = Meteor.subscribe "Orders"
ReactionCore.Subscriptions.Tags = Meteor.subscribe "Tags"
ReactionCore.Subscriptions.Media = Meteor.subscribe "Media"

###
# Autorun dependencies
###
# account address initialization
# Tracker.autorun ->
#   account = ReactionCore.Collections.Accounts.findOne()
#   unless Session.get('address') or account?.profile?.addressBook
#     #Setting Default because we get here before location calc
#     address = {
#       latitude: null,
#       longitude: null,
#       country: 'United States',
#       city: null,
#       state: null,
#       stateCode: null,
#       zipcode: null,
#       streetName: null,
#       streetNumber: null,
#       countryCode: 'US'
#     }
#     Session.set("address",address)
