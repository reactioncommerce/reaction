###
# methods typically used for checkout (shipping, taxes, etc)
###
Meteor.methods
  ###
  # gets shipping rates and updates the users cart methods
  ###
  updateShipmentQuotes: (cartSession) ->
    # unless check cartSession, ReactionCore.Schemas.Cart
    unless cartSession
      ReactionCore.Events.info "no cart passed to update rates, return null."
      return null
    if cartSession.shipping?.address and cartSession.shipping?.shipmentQuotes then return

    cart = Cart.findOne(cartSession._id)
    rates = Meteor.call "getShippingRates"
    #TODO:
    # Apply rate filters here

    # update users cart
    if rates.length > 0
      ReactionCore.Collections.Cart.update('_id': cartSession._id, { $set: {'shipping.shipmentQuotes': rates}})

    # return in the rates object
    ReactionCore.Events.debug rates
    return rates

  ###
  #  just gets rates, without updating anything
  ###
  getShippingRates: (cartSession) ->
    # check cartSession, ReactionCore.Schemas.Cart
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

    # TODO:
    # wire in external shipping methods here, add to rates

    # return in the rates object
    ReactionCore.Events.info "getShippingrates returning rates"
    return rates