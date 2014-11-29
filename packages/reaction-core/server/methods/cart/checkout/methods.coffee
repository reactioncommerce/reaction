###
# methods typically used for checkout (shipping, taxes, etc)
###
Meteor.methods
  ###
  # gets shipping rates and updates the users cart methods
  ###
  updateCartShippingRates: (cartSession) ->
    unless cartSession then return null
    if cartSession.shipping?.address and cartSession.shipping?.shipmentMethods then return

    cart = Cart.findOne(cartSession._id)
    rates = Meteor.call "getShippingRates"
    # update users cart
    Cart.update(cartSession._id, { $set: {'shipping.shipmentMethods': rates}})
    # return in the rates object
    return rates

  ###
  #  just gets rates, without updating anything
  ###
  getShippingRates: () ->
    rates = []
    shop = Shops.findOne(ReactionCore.getShopId())
    # flat rate / table shipping rates
    for carrier,value in shop?.shipping
      for method,index in carrier.methods
        if method?.rate?
          method.rate = "Free" if method.rate is '0'
          rates.push carrier: value, method: index, label:method.label, value:method.rate
      console.log "returning rates" if Meteor.settings.public?.isDebug

    # TODO:
    # wire in external shipping methods here, add to rates

    # return in the rates object
    return rates