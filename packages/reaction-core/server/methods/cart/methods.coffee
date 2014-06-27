Meteor.methods
  ###
  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  ###
  addToCart: (cartSession, productId, variantData, quantity) ->
    # createCart will create for session if necessary, update user if necessary,
    # sync all user's carts, and return the cart
    currentCart = Meteor.call "createCart", cartSession.sessionId

    return false unless currentCart

    cartVariantExists = Cart.findOne _id: currentCart._id, "items.variants._id": variantData._id
    if cartVariantExists
      Cart.update
        _id: currentCart._id,
        "items.variants._id": variantData._id,
        { $set: {updatedAt: new Date()}, $inc: {"items.$.quantity": quantity}},
      (error, result) ->
        console.log "error adding to cart" if error?
        console.log Cart.namedContext().invalidKeys() if error?
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
        console.log "error adding to cart" if error?
        console.log error if error?

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
  createCart: (sessionId) ->
    return false unless sessionId
    userId = Meteor.userId()
    shopId = Meteor.app.getShopId(@)
    # We set the shopId just so that we have something in $set for sure
    mod = shopId: Meteor.app.getShopId(@)
    # If and only if logged in, we also set the userId.
    # We don't want to do this if userId is null because once a user owns the cart,
    # we never want to remove that ownership.
    mod.userId = userId if userId?
    try
      # We upsert. If a cart with this session and shop IDs already exists, this will
      # either have no effect or will set the userId. If no cart exists, it will be
      # created with sessionId, shopId, and potentially userId (if logged in)
      Cart.upsert {sessionId: sessionId, shopId: shopId}, {$set:mod}
      # We might need to sync multiple carts for the same user, only if logged in
      Meteor.call "syncCarts", userId if userId?
    catch error
      console.log "createCart error: ", error
    # Finally, we return the cart for convenience
    return Cart.findOne(sessionId: sessionId, shopId: shopId)

  ###
  # synch multiple carts when there is more than user cart
  ###
  syncCarts: (userId) ->
    userId = userId || Meteor.userId()
    shopId = Meteor.app.getShopId(@)
    # console.log "synch carts for: ", userId
    userCarts = Cart.find(shopId: shopId, userId: userId)
    return unless userCarts.count() > 1
    userCarts.observeChanges
      changed: (_id, items) ->
        Cart.find(shopId: shopId, userId: userId).forEach (cart) ->
          if cart._id isnt _id then Cart.update(_id: cart._id, {$set: items})
          return
    return
  ###
  # removes a variant from the cart
  ###
  removeFromCart: (cartId, variantData) ->
    # We select on userId, too, for security  todo: also select on sessionId?
    return Cart.update {_id: cartId, userId: @userId}, {$pull: {"items": {"variants": variantData} } }

  ###
  # add payment method
  ###
  paymentMethod: (cartId, paymentMethod) ->
    # We select on userId, too, for security  todo: also select on sessionId?
    return Cart.update {_id: cartId, userId: @userId}, {$addToSet:{"payment.paymentMethod":paymentMethod}}

  ###
  # adjust inventory when an order is placed
  ###
  inventoryAdjust: (orderId) ->
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
  copyCartToOrder: (cart) ->
    currentUserId = Meteor.userId()
    # Check userId & sessionId against current
    return false if cart.shopId isnt Meteor.app.getShopId(@) or cart.userId isnt currentUserId
    #Retrieving cart twice (once on call)to ensure accurate clone from db
    currentCartId = cart._id
    # cart = Cart.findOne(cartId)
    now = new Date()
    cart.createdAt = now
    cart.updatedAt = now
    cart._id = Random.id()
    cart.state = "orderCreated"
    cart.status = "new"

    try
      Orders.insert cart
    catch error
      console.log "error in order insert"
      console.log Orders.namedContext().invalidKeys()

    Cart.remove userId: currentUserId
    return cart._id #new order id

  ###
  # method to add new addresses to a user's profile
  ###
  addressBookAdd: (doc) ->
    check(doc, AddressSchema)
    @unblock()
    currentUserId = Meteor.userId()
    if doc.isDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isDefault": true
      ,
        $set:
          "profile.addressBook.$.isDefault": false
    # Add new address
    doc._id = Random.id()
    return Meteor.users.update _id: currentUserId, $addToSet: {"profile.addressBook": doc}

  ###
  #method to update existing address in user's profile
  ###
  addressBookUpdate: (doc) ->
    check(doc, AddressSchema)
    @unblock()
    currentUserId = Meteor.userId()
    #reset existing default
    if doc.isDefault
      Meteor.users.update
        _id: currentUserId
        "profile.addressBook.isDefault": true
      ,
        $set:
          "profile.addressBook.$.isDefault": false
    # update existing address
    Meteor.users.update
      _id: currentUserId
      "profile.addressBook._id": doc._id
    ,
      $set:
        "profile.addressBook.$": doc