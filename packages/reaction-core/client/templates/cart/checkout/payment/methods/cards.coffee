Template.corePaymentMethods.helpers
  cartPayerName: ->
    Cart.findOne()?.payment?.address?.fullName
