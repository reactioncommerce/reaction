# Additional match method Optional or null, undefined
Match.OptionalOrNull = (pattern) -> Match.OneOf undefined, null, pattern

###
#  getCurrentCart(sessionId)
#  create, merge the session and user carts and return cart cursor
#
# There should be one cart for each independent, non logged in user session
# When a user logs in that cart now belongs to that user and we use the a single user cart.
# If they are logged in on more than one devices, regardless of session, the user cart will be used
# If they had more than one cart, on more than one device,logged in at seperate times then merge the carts
#
###
###
#  Cart Methods
###
Meteor.methods
  ###
  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  ###
  addToCart: (cartId, productId, variantData, quantity) ->
    check cartId, String
    check productId, String
    check variantData, ReactionCore.Schemas.ProductVariant
    check quantity, String
    # TODO: addToCart quantity should be a number

    shopId = ReactionCore.getShopId(@)
    currentCart = Cart.findOne cartId

    # TODO: refactor to check currentCart instead of another findOne
    cartVariantExists = Cart.findOne _id: currentCart._id, "items.variants._id": variantData._id
    # update quantity for existing cart variant
    if cartVariantExists
      Cart.update {
        _id: currentCart._id
        'items.variants._id': variantData._id
      },
        $set: updatedAt: new Date
        $inc: 'items.$.quantity': quantity
      (error, result) ->
        if error
          ReactionCore.Events.warn "error adding to cart" , Cart.simpleSchema().namedContext().invalidKeys()
          return error
        return
    # add new cart items
    else
      product = ReactionCore.Collections.Products.findOne(productId)
      Cart.update { _id: currentCart._id }, { $addToSet: items:
        _id: Random.id()
        shopId: product.shopId
        productId: productId
        quantity: quantity
        variants: variantData }, (error, result) ->
        if error
          ReactionCore.Events.warn "error adding to cart", Cart.simpleSchema().namedContext().invalidKeys()
          return
        return

  ###
  # removes a variant from the cart
  ###
  removeFromCart: (sessionId, cartId, variantData) ->
    check sessionId, String
    check cartId, String
    check variantData, Object

    # We select on sessionId or userId, too, for security
    return Cart.update
      _id: cartId
      $or: [
        {userId: @userId}
        {sessionId: sessionId}
      ]
    , {$pull: {"items": {"variants": variantData} } }


  ###
  # adjust inventory when an order is placed
  ###
  inventoryAdjust: (orderId) ->
    check orderId, String

    order = Orders.findOne orderId
    return false unless order
    for product in order.items
      Products.update {_id: product.productId, "variants._id": product.variants._id}, {$inc: {"variants.$.inventoryQuantity": -product.quantity }}
    return

  ###
  # when a payment is processed we want to copy the cart
  # over to an order object, and give the user a new empty
  # cart. reusing the cart schema makes sense, but integrity of
  # the order, we don't want to just make another cart item
  #
  # TODO:  Partial order processing, shopId processing
  #
  ###
  copyCartToOrder: (cartId) ->
    check cartId, String
    # extra validation + transform methods
    cart = ReactionCore.Collections.Cart.findOne(cartId)
    invoice = {}

    # transform cart pricing into order invoice
    invoice.shipping = cart.cartShipping()
    invoice.subtotal = cart.cartSubTotal()
    invoice.taxes = cart.cartTaxes()
    invoice.discounts = cart.cartDiscounts()
    invoice.total =  cart.cartTotal()
    cart.payment.invoices = [invoice]

    # attach an email if user cart
    if cart.userId and !cart.email
      user = Meteor.user cart.userId
      emails = _.pluck user.emails, "address"
      cart.email = emails[0]

    # TODO: these defaults should be done in schema
    now = new Date()
    cart.createdAt = now
    cart.updatedAt = now

    # set workflow status
    cart.state = "orderCreated"
    cart.status = "new"

    # update orderId
    cart._id = Random.id()
    cart.cartId = cartId

    ###
    # final sanity check
    # TODO add `check cart, ReactionCore.Schemas.Order`
    # and add some additional validation that all is good
    # and no tampering has occurred
    ###

    try
      orderId = Orders.insert cart
      if orderId
        Cart.remove _id: cartId
        ReactionCore.Events.info "Completed cart for " + cartId

    catch error
      ReactionCore.Events.info "error in order insert"
      ReactionCore.Events.warn error, Orders.simpleSchema().namedContext().invalidKeys()
      return error

    # return new orderId
    return orderId

  setShipmentAddress: (cartId, address) ->
    check cartId, String
    check address, Object
    unless cartId and address then return
    #
    cart = ReactionCore.Collections.Cart.findOne _id: cartId, userId: Meteor.userId
    if cart
      # update shipping address
      Cart.update cartId, {$set: {"shipping.address": address} }
      # refresh rates with new address
      Meteor.call "updateShipmentQuotes", cartId
    else
      throw new Meteor.Error "setShipmentAddress: Invalid request"

  ###
  # merge matching sessionId cart into specified userId cart
  ###
  mergeCart: (cartId) ->
    check cartId, String
    @unblock()

    Cart = ReactionCore.Collections.Cart
    currentCart = Cart.findOne cartId
    userId = currentCart.userId
    sessionId = ReactionCore.sessionId
    shopId = ReactionCore.getShopId()

    # don't merge into anonymous accounts
    if Roles.userIsInRole userId, 'anonymous', shopId then return

    # if meteor user is not anonymous
    sessionCarts = Cart.find({ $or: [{'userId': userId }, {'sessions': {$in: [sessionId] } } ] })
    ReactionCore.Events.info "begin merge processing into: " + currentCart._id

    # merge session cart into current user cart
    sessionCarts.forEach (sessionCart) ->
      if userId isnt sessionCart.userId and currentCart._id isnt sessionCart._id
        # catch undefined items
        unless sessionCart.items then sessionCart.items = []
        # update userCart and remove sessionCart
        Cart.update currentCart._id,
            $addToSet:
              items: $each: sessionCart.items
              sessions: $each: sessionCart.sessions

        # a little garbage collection
        Cart.remove sessionCart._id
        Meteor.users.remove sessionCart.userId
        ReactionCore.Collections.Accounts.remove userId: sessionCart.userId

        ReactionCore.Events.info "delete cart: " + sessionCart._id + "and user: " + sessionCart.userId
        ReactionCore.Events.info "processed merge for cartId: " + sessionCart._id
    return true

  createCart: (userId) ->
    check userId, String
    @unblock()

    Cart = ReactionCore.Collections.Cart
    sessionId = ReactionCore.sessionId
    shopId = ReactionCore.getShopId()

    newCartId = Cart.insert sessions: [sessionId], shopId: shopId, userId: userId

    ReactionCore.Events.info "created cart: " + newCartId + " for user: " + userId

    return Cart.find newCartId
