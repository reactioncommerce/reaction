###
# These helpers can be used in general shipping packages
# or replaced, but are meant to be generalized in nature.
###
Template.checkoutShipping.helpers
  # retrieves current rates and updates shipping rates
  # in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentMethods: () ->
    Meteor.call "updateCartShippingRates", @
    return @.shipping?.shipmentMethods

  # helper to display currently selected shipmentMethod
  isSelected: (cart)->
    shipmentMethod  = cart.shipping.shipmentMethod
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
Template.checkoutShipping.events
  'click .list-group-item': (event) ->
    $('.checkout-shipping .active').removeClass('active')
    $(event.currentTarget).addClass('active')
    unless @.shipping?.shipmentMethod then CartWorkflow.shipmentMethod(@)
    Session.set "shipmentMethod", @