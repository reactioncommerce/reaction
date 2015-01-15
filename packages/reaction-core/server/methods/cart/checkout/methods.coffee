###
# methods typically used for checkout (shipping, taxes, etc)
###
Meteor.methods
  ###
  # gets shipping rates and updates the users cart methods
  ###
  updateCartShippingRates: (cartSession) ->
    unless cartSession
      ReactionCore.Events.info "no cart passed to update rates, return null."
      return null
    if cartSession.shipping?.address and cartSession.shipping?.shipmentMethods then return

    cart = Cart.findOne(cartSession._id)
    rates = Meteor.call "getShippingRates"
    # update users cart
    if rates.length > 0
      Cart.update(cartSession._id, { $set: {'shipping.shipmentMethods': rates}})
    # return in the rates object
    return rates

  ###
  #  just gets rates, without updating anything
  ###
  getShippingRates: () ->
    rates = []
    shipping = ReactionCore.Collections.Shipping.find({'shopId': ReactionCore.getShopId()})
    # flat rate / table shipping rates
    shipping.forEach (shipping) ->
      ## get all enabled rates
      for method, index in shipping.methods when method.enabled is true
        unless method.rate then method.rate = 0 #
        unless method.handling then method.handling = 0
        # rules

        # rate is shipping and handling
        rate = method.rate+method.handling
        rates.push carrier: shipping.provider.label, method: method, rate: rate


      ReactionCore.Events.info rates
      ReactionCore.Events.info "returning rates"

    # TODO:
    # wire in external shipping methods here, add to rates

    # return in the rates object
    return rates