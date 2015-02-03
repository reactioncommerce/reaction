###
# These helpers can be used in general shipping packages
# or replaced, but are meant to be generalized in nature.
###
Template.coreCheckoutShipping.helpers
  # retrieves enabled shipping package templates and returns as array
  shippingTemplates: ->
    return ReactionCore.Collections.Packages.find({
      'enabled':true,
      'registry.shippingTemplate': {$exists: true},
      'registry.provides': {$in: ["shippingMethod"]}
      })

  # retrieves current rates and updates shipping rates
  # in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: () ->
    cart = ReactionCore.Collections.Cart.findOne()
    unless cart.shipping?.shipmentQuotes
      Meteor.call "updateShipmentQuotes", cart

    return cart.shipping?.shipmentQuotes

  # helper to make sure there are some shipping providers
  shippingConfigured: () ->
    exists = ReactionCore.Collections.Shipping.find({'methods.enabled': true}).count()
    return exists
  # helper to display currently selected shipmentMethod
  isSelected: (cart)->
    shipmentMethod  = ReactionCore.Collections.Cart.findOne()?.shipping?.shipmentMethod
    unless shipmentMethod then return
    # if there is already a selected method, set active
    if _.isEqual @.method, shipmentMethod?.method
      Session.set "shipmentMethod",this
      CartWorkflow.shipmentMethod()
      return "active"

###
# Set and store cart shipmentMethod
# this copies from shipmentMethods (retrieved rates)
# to shipmentMethod (selected rate)
###
Template.coreCheckoutShipping.events
  'click .list-group-item': (event) ->
    $('.checkout-shipping .active').removeClass('active')
    $(event.currentTarget).addClass('active')
    unless @.shipping?.shipmentMethod then CartWorkflow.shipmentMethod(@)
    Session.set "shipmentMethod", @