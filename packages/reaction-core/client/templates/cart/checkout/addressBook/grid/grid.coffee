Template.addressBookGrid.helpers
  addressBook: ->
    account = ReactionCore.Collections.Accounts.findOne()
    return account.profile?.addressBook

  selectedBilling: ->
    cart = Cart.findOne()
    if @.isBillingDefault
      unless cart?.payment?.address
        CartWorkflow.paymentAddress(@)
    if @._id is cart?.payment?.address._id
      # find current address, and if none
      cart = Cart.findOne({'payment.address._id': @._id})
      # allow last used address to default
      unless cart
        CartWorkflow.paymentAddress(@)
      return "active"

  selectedShipping: ->
    cart = Cart.findOne()
    if @.isShippingDefault
      unless cart?.shipping?.address
        CartWorkflow.shipmentAddress(@)
    # return active selection
    if @._id is cart?.shipping?.address?._id
      return "active"

Template.addressBookGrid.events
  'click .address-ship-to': (event,template) ->
    CartWorkflow.shipmentAddress(@)

  'click .address-bill-to': (event,template) ->
    CartWorkflow.paymentAddress(@)
