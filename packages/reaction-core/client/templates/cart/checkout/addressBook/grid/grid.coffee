###
# handles display of addressBook grid
###
Template.addressBookGrid.helpers
  # selectedBilling sets default and returns the active class
  selectedBilling: ->
    cart = ReactionCore.Collections.Cart.findOne()
    if cart
      # return active selection
      if @._id is cart?.payment?.address?._id
        return "active"
      # add default payment address if none
      if @.isBillingDefault and !cart?.payment?.address?.fullName
          CartWorkflow.paymentAddress(@)


  # selectedShipping sets default and returns the active class
  selectedShipping: ->
    cart = ReactionCore.Collections.Cart.findOne()
    # automatically apply default address
    if cart
      # return active selection
      if @._id is cart.shipping.address?._id
        return "active"
      # add default shipping address if none
      if @.isShippingDefault and !cart?.shipping?.address?.fullName
        CartWorkflow.shipmentAddress(@)
###
# events
###
Template.addressBookGrid.events
  'click .address-ship-to': (event,template) ->
    CartWorkflow.shipmentAddress(@)

  'click .address-bill-to': (event,template) ->
    CartWorkflow.paymentAddress(@)
