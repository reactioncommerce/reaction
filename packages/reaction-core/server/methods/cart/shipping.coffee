###
# methods typically used for checkout (shipping, taxes, etc)
###
Meteor.methods
  ###
  # gets shipping rates and updates the users cart methods
  # TODO: add orderId argument/fallback
  ###
  updateShipmentQuotes: (cartId) ->
    return unless cartId
    check cartId, String
    @unblock
    cart = ReactionCore.Collections.Cart.findOne(cartId)
    if cart
      # get fresh quotes
      # TODO: Apply rate filters here
      rates = Meteor.call "getShippingRates", cart

      # update users cart
      if rates.length > 0
        ReactionCore.Collections.Cart.update '_id': cartId,
          $set:
            'shipping.shipmentQuotes': rates

      # return in the rates object
      ReactionCore.Events.debug rates
      return


  ###
  #  just gets rates, without updating anything
  ###
  getShippingRates: (options) ->
    check options, Object
    # get shipping rates for each provider
    rates = []
    selector = {shopId:  ReactionCore.getShopId()}
    # if we have products from multiple shops in the cart.items we have to select the shipping options from those shops
    shops = []
    for product in options.items
      if product.shopId not in shops
        shops.push product.shopId

    # not sure if this is the correct condition since it will most certainly always be positive, if there are any products in the cart
    shops.push ReactionCore.getShopId() if ReactionCore.getShopId() not in shops
    if shops?.length > 0
      selector = {shopId: {$in: shops}}
    shipping = ReactionCore.Collections.Shipping.find(selector);
    # flat rate / table shipping rates
    shipping.forEach (shipping) ->
      ## get all enabled rates
      for method, index in shipping.methods when method.enabled is true
        unless method.rate then method.rate = 0 #
        unless method.handling then method.handling = 0
        # rules

        # rate is shipping and handling
        rate = method.rate+method.handling
        rates.push carrier: shipping.provider.label, method: method, rate: rate, shopId: shipping.shopId

    # TODO:
    # wire in external shipping methods here, add to rates

    # return in the rates object
    ReactionCore.Events.info "getShippingrates returning rates"
    ReactionCore.Events.debug "rates", rates
    return rates

  ###
  # add payment method
  ###
  paymentMethod: (cartId, paymentMethod) ->
    check cartId, String
    check paymentMethod, Object
    return Cart.update _id: cartId, {$addToSet:{"payment.paymentMethod":paymentMethod}}
