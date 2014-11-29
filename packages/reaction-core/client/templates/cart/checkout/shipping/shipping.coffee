Template.checkoutShipping.helpers
  # updates shipping rates in the cart collection
  rates: () ->
    Meteor.call "updateCartShippingRates", @
    return @.shipping?.shipmentMethods

  isSelected: (cart)->
    shipmentMethod  = cart.shipping.shipmentMethod
    unless shipmentMethod then return

    if (shipmentMethod?.carrier is this.carrier) and (shipmentMethod?.method is this.method)
      Session.set "shipmentMethod",this
      CartWorkflow.shipmentMethod()
      return "active"


Template.checkoutShipping.events
  'click .list-group-item': (event) ->
    $('.checkout-shipping .active').removeClass('active')
    $(event.currentTarget).addClass('active')
    unless @.shipping?.shipmentMethod then CartWorkflow.shipmentMethod(@)
    Session.set "shipmentMethod",@

# NEXT TODO:
#  Uncaught event shipmentMethod inappropriate in current state new

#  check why cart is new state, and not saved state when reloading.