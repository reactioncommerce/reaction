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
@getCurrentCart = (sessionId, shopId, userId) ->
  check sessionId, String
  check shopId, Match.OptionalOrNull(String)
  check userId, Match.OptionalOrNull(String)

  shopid = shopId || ReactionCore.getShopId(@)
  userId = userId || "" # no null

  Cart = ReactionCore.Collections.Cart
  currentCarts = Cart.find 'shopId': shopId, 'sessions': $in: [ sessionId ]
  #
  # if sessionCart just logged out, remove sessionId and create new sessionCart
  #
  if currentCarts.count() is 0
    newCartId = Cart.insert  sessions: [sessionId], shopId: shopId, userId: userId
    ReactionCore.Events.debug "Created new session cart", newCartId
    currentCart = Cart.find newCartId
    return currentCart

  # check for user carts and merge if necessary
  currentCarts.forEach (cart) ->
    #
    # if user just logged out, remove sessionId and create new sessionCart
    # leave the userId so we can merge with this cart when user logs back in
    #
    if cart.userId and !userId
      Cart.update cart._id, $pull: 'sessions': sessionId
      ReactionCore.Events.debug "Logging out. Removed session from cart."
    #
    # if sessionCart is first time authenticated add user to cart
    # add sessionId to any existing userCart
    # and then merge session cart into userCart
    # and remove sessionCart so that the user has clean cart on logout
    #
    if userId
      userCart = Cart.findOne
        'userId': userId
        'shopId': shopId
        'sessions': $nin: [ sessionId ]

      # merge session cart into usercart
      if userCart and !cart.userId
        # catch undefined items
        unless cart.items then cart.items = []
        # update userCart and remove sessionCart
        Cart.update userCart._id,
            $set:
              userId: userId
            $addToSet:
              items: $each: cart.items
              sessions: $each: cart.sessions
        Cart.remove cart._id
        ReactionCore.Events.debug "Updated user cart", cart._id, "with sessionId: " + sessionId
        return Cart.find userCart._id
      # neither a user existing user cart, just add userId
      else if !userCart and !cart.userId
        Cart.update cart._id,
          $set:
            userId: userId
        return Cart.find cart._id

  # if no user cart actions, just return current cart
  if currentCarts.count() is 1
    cart = currentCarts.fetch()
    ReactionCore.Events.debug "getCurrentCart returned sessionId:" + sessionId + " cartId: " + cart[0]._id
    currentCarts = Cart.find cart[0]._id
    return currentCarts

  # if all patterns failed.
  ReactionCore.Events.debug "getCurrentCart error:", currentCarts
  return currentCarts

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
      cart.email = Meteor.user(cart.userId).emails[0].address

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
