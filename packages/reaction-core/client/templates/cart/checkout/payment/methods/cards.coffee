Template.corePaymentMethods.helpers
  paymentTemplates: ->
    return ReactionCore.Collections.Packages.find({
      'enabled':true,
      'registry.paymentTemplate': {$exists: true},
      'registry.provides': {$in: ["paymentMethod"]}
      })

  cartPayerName: ->
    Cart.findOne()?.payment?.address?.fullName