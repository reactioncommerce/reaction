Template.addressBookGrid.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  selectedBilling: ->
    if @.isBillingDefault
      unless Session.get "billingUserAddressId"
        Session.setDefault "billingUserAddressId", @._id
        CartWorkflow.paymentAddress(@)
    if Session.equals "billingUserAddressId", @._id
      # find current address, and if none
      cart = Cart.findOne({'payment.address._id': @._id})
      # allow last used address to default
      unless cart
        CartWorkflow.paymentAddress(@)
      return "active"

  selectedShipping: ->
    if @.isShippingDefault
      unless Session.get "shippingUserAddressId"
        Session.setDefault "shippingUserAddressId",@._id
        CartWorkflow.shipmentAddress(@)
    if Session.equals "shippingUserAddressId", @._id
      # find current address, and if none
      cart = Cart.findOne({'shipping.address._id': @._id})
      # allow last used address to default
      unless cart
        CartWorkflow.shipmentAddress(@)
      return "active"


Template.addressBookGrid.events
  'click .address-ship-to': (event,template) ->
    CartWorkflow.shipmentAddress(@)
    Session.set("shippingUserAddressId", @._id)

  'click .address-bill-to': (event,template) ->
    CartWorkflow.paymentAddress(@)
    Session.set("billingUserAddressId", @._id)
