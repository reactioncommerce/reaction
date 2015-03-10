###
# methods typically used for checkout (shipping, taxes, etc)
###
Meteor.methods
  ###
  # gets shipping rates and updates the users cart methods
  # TODO: add orderId argument/fallback
  ###
  updateShipmentQuotes: (cartId) ->
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
    check options, Match.Optional(Object)
    # get shipping rates for each provider
    rates = []
    selector = {shopId:  ReactionCore.getShopId()}
    # if we have products from multiple shops in the cart.items we have to select the shippign options from those shops
    shops = []
    for product in options.items
      productShop = ReactionCore.Collections.Products.findOne(product.productId);
      if productShop.shopId not in shops
        shops.push productShop.shopId if productShop.shopId not in shops
    # not sure if this is the correct condition since it will most certainly always be positive, if there are any products in the cart    
    if shops.length > 0
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
    return rates

  ###
  # add payment method
  ###
  paymentMethod: (sessionId, cartId, paymentMethod) ->
    check sessionId, String
    check cartId, String
    check paymentMethod, Object
    # We select on sessionId or userId, too, for security
    return Cart.update
      _id: cartId
      $or: [
        {userId: @userId}
        {sessionId: sessionId}
      ]
    , {$addToSet:{"payment.paymentMethod":paymentMethod}}


  ###
  # method to add new addresses to a user's profile
  ###
  addressBookAdd: (doc, updateDoc, currentDoc) ->
    check doc, ReactionCore.Schemas.Address
    check updateDoc, Object
    check currentDoc, null
    @unblock()

    # add address
    currentUserId = Meteor.userId()
    if doc.isShippingDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isShippingDefault": true
      ,
        $set:
          "profile.addressBook.$.isShippingDefault": false
    if doc.isBillingDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isBillingDefault": true
      ,
        $set:
          "profile.addressBook.$.isBillingDefault": false
    # Add new address
    doc._id = Random.id()

    return Meteor.users.update _id: currentUserId, {$addToSet: {"profile.addressBook": doc}}

  ###
  # method to update existing address in user's profile
  ###
  addressBookUpdate: (doc, updateDoc, currentDoc) ->
    check doc, ReactionCore.Schemas.Address
    check updateDoc, Object
    check currentDoc, String
    @unblock()

    #reset existing default
    currentUserId = Meteor.userId()
    if doc.isShippingDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isShippingDefault": true
      ,
        $set:
          "profile.addressBook.$.isShippingDefault": false
    if doc.isBillingDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isBillingDefault": true
      ,
        $set:
          "profile.addressBook.$.isBillingDefault": false
    # update existing address
    Meteor.users.update
      _id: currentUserId
      "profile.addressBook._id": doc._id
    ,
      $set:
        "profile.addressBook.$": doc
