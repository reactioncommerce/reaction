###
# These helpers can be used in general shipping packages
# or replaced, but are meant to be generalized in nature.
###
cart = ReactionCore.Collections.Cart.findOne()

Template.coreCheckoutShipping.helpers
  # retrieves current rates and updates shipping rates
  # in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: () ->
    cart = ReactionCore.Collections.Cart.findOne()
    return cart?.shipping?.shipmentQuotes

  # helper to make sure there are some shipping providers
  shippingConfigured: () ->
    exists = ReactionCore.Collections.Shipping.find({'methods.enabled': true}).count()
    return exists
  # helper to display currently selected shipmentMethod
  isSelected: (cart)->
    shipmentMethod  = cart?.shipping?.shipmentMethod
    unless shipmentMethod then return
    # if there is already a selected method, set active
    if _.isEqual @.method, shipmentMethod?.method
      Session.set "shipmentMethod", this
      return "active"

###
# Set and store cart shipmentMethod
# this copies from shipmentMethods (retrieved rates)
# to shipmentMethod (selected rate)
###
Template.coreCheckoutShipping.events
  'click .list-group-item': (event, template) ->
    try
      Meteor.call "setShipmentAddress", cart._id, @
    catch
      console.info "Cannot change methods while processing."
      event.preventDefault()
      event.stopPropagation()
      return

