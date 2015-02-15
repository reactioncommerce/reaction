Template.addressBookGrid.helpers
  addressBook: ->
    Meteor.user().profile?.addressBook

  selectedBilling: ->
    if @.isBillingDefault
      # console.log "billingDefault", @._id
      unless Session.get "billingUserAddressId"
        # console.log "set default billing: ", @._id
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
      # console.log "shippingDefault",@._id
      unless Session.get "shippingUserAddressId"
        # console.log "set default shipping: ",@._id
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
