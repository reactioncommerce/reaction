Meteor.methods
  ###
  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  ###
  addToCart: (cartSession, productId, variantData, quantity) ->
    check cartSession, {sessionId: String, userId: Match.OneOf(String, null)}
    check productId, String
    check variantData, Object
    check quantity, String
    #
    # createCart will create for session if necessary, update user if necessary,
    # sync all user's carts, and return the cart
    #
    shopId = ReactionCore.getShopId(@)
    currentCart = createCart cartSession.sessionId, @userId, shopId

    return false unless currentCart

    cartVariantExists = Cart.findOne _id: currentCart._id, "items.variants._id": variantData._id
    if cartVariantExists
      Cart.update
        _id: currentCart._id,
        "items.variants._id": variantData._id,
        { $set: {updatedAt: new Date()}, $inc: {"items.$.quantity": quantity}},
      (error, result) ->
        ReactionCore.Events.info "error adding to cart" if error
        ReactionCore.Events.info Cart.simpleSchema().namedContext().invalidKeys() if error
    # add new cart items
    else
      Cart.update _id: currentCart._id,
        $addToSet:
          items:
            _id: Random.id()
            productId: productId
            quantity: quantity
            variants: variantData
      , (error, result) ->
        ReactionCore.Events.info "error adding to cart" if error
        ReactionCore.Events.warn error if error

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
  ###
  copyCartToOrder: (cartId) ->
    check cartId, String
    # extra validation + transform methods
    cart = ReactionCore.Collections.Cart.findOne(cartId)
    invoice = {}

    ###
    # todo: implement guest checkout here.
    # save sessionId to cart collection
    # if this guest sessionId becomes a user
    # or if an email sent to the user confirms sessionId belongs to this email
    # it can be reconnected to any user account where the email is registered.
    # we won't validate user account here further
    ###

    # transform cart pricing into order invoice
    invoice.shipping = cart.cartShipping()
    invoice.subtotal = cart.cartSubTotal()
    invoice.taxes = cart.cartTaxes()
    invoice.discounts = cart.cartDiscounts()
    invoice.total =  cart.cartTotal()
    cart.payment.invoices = [invoice]

    # todo: these defaults should be done in schema
    now = new Date()
    cart.createdAt = now
    cart.updatedAt = now

    # set workflow status
    cart.state = "orderCreated"
    cart.status = "new"

    ###
    # final sanity check
    # todo add `check cart, ReactionCore.Schemas.Order`
    # and add some additional validation that all is good
    # and no tampering has occurred
    ###

    try
      orderId = Orders.insert cart
      Cart.remove _id: cart._id
    catch error
      ReactionCore.Events.info "error in order insert"
      ReactionCore.Events.warn error, Orders.simpleSchema().namedContext().invalidKeys()
      return error

    # return new orderId
    return orderId


###
# create a cart
# create for session if necessary, update user if necessary,
# sync all user's carts, and return the cart
#
# * There should be one cart for each independent, non logged in user session
# * When a user logs in that cart now belongs to that user
# * If they are logged in on more than one devices, regardless of session, that cart will be used
# * If they had more than one cart, on more than one device, and login at seperate times it should merge the carts
###
@createCart = (sessionId, userId, shopId) ->
  check sessionId, String
  check userId, Match.OneOf(String, null)
  check shopId, String
  # try to create cart
  try
    # Is there a cart for this session?
    sessionCart = Cart.findOne(sessionId: sessionId, shopId: shopId)

    # Is there a logged in user?
    if userId?

      # Do we have an existing user cart?
      userCart = Cart.findOne(userId: userId, shopId: shopId)

      # If there is a cart for this session because we just logged in
      if sessionCart?
        # If we also have a user cart
        if userCart?
          # Then merge the session cart into the existing user cart
          # TODO: Might need to merge other values, figure out proper state, etc?
          Cart.update userCart._id,
            $addToSet:
              items:
                $each: sessionCart.items || []
          # And then remove the session cart
          Cart.remove(_id: sessionCart._id)
          # And return the user cart
          result = Cart.findOne(_id: userCart._id)
          ReactionCore.Events.info "Merged session cart", sessionCart._id, "into user cart", userCart._id
        # But if we don't already have a user cart
        else
          # Then we convert the session cart to a user cart
          Cart.update sessionCart._id, {$set: {userId: userId}, $unset: {sessionId: ""}}
          # And then return this cart
          result = Cart.findOne(_id: sessionCart._id)
          ReactionCore.Events.info "Converted cart", sessionCart._id, "from session cart to user cart"

      # If there was not a session cart and we are logged in
      else
        # We return the existing user cart if there is one
        if userCart?
          result = userCart
          ReactionCore.Events.info "Using existing user cart", userCart._id
        # Or we create a new user cart
        else
          newCartId = Cart.insert(userId: userId, shopId: shopId)
          # And return that
          result = Cart.findOne(_id: newCartId)
          ReactionCore.Events.info "Created new user cart", newCartId

    # If we don't have a logged in user
    else
      # Return the session cart if we already have one
      if sessionCart?
        result = sessionCart
        ReactionCore.Events.info "Using existing session cart", sessionCart._id
      # Otherwise create one
      else
        newCartId = Cart.insert {sessionId: sessionId, shopId: shopId}
        # And then return that
        result = Cart.findOne(_id: newCartId)
        ReactionCore.Events.info "Created new session cart", newCartId

  catch error
    ReactionCore.Events.info "createCart error: ", error

  # Finally, we return the correct cart for convenience
  return result
