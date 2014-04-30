Meteor.methods
  ###
  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  ###
  addToCart: (cartSession, productId, variantData, quantity) ->
    currentCart = Cart.findOne sessionId: cartSession.sessionId, userId: cartSession.userId
    #if no cart, create a new one before adding to cart
    unless currentCart?
      Meteor.call "createCart", cartSession.sessionId, cartSession.userId
      currentCart = Cart.findOne sessionId: cartSession.sessionId, userId: cartSession.userId

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
  # if there is no carts because the user just logged in check for existing carts and merge them
  # and update the current session cart with this user id
  ###
  createCart: (sessionId, userId) ->
    if sessionId? is true
      shopId = Meteor.app.getCurrentShop(@)._id
      if userId? is true
        # console.log "update existing cart to userId"
        currentCart = Cart.findOne(sessionId: sessionId)
        if currentCart
          Cart.upsert {sessionId: sessionId}, {$set:{shopId: shopId, userId: userId}}, (error, result) ->
            console.log error if error
            Meteor.call "synchCarts", userId
            return Cart.findOne(sessionId: sessionId) if result

      # console.log "upserting new session cart"
      Cart.upsert {sessionId: sessionId, userId: userId}, {$set:{shopId: shopId, sessionId: sessionId, userId: userId}}, (error, result) ->
        console.log error if error
    return Cart.findOne(sessionId: sessionId)

  ###
  # synch multiple carts when there is more than user cart
  ###
  synchCarts: (userId) ->
    userId = userId || Meteor.userId()
    shopId = Meteor.app.getCurrentShop(@)._id
    # console.log "synch carts for: ", userId
    userCarts = Cart.find(shopId: shopId, userId: userId)
    userCarts.observeChanges
      changed: (_id, items) ->
        carts = userCarts.fetch()
        for cart in Cart.find(shopId: shopId, userId: userId).fetch()
          if cart._id isnt _id then Cart.update(_id: cart._id, {$set: items})
  ###
  # removes a variant from the cart
  ###
  removeFromCart: (cartId, variantData) ->
    Cart.update({_id: cartId}, {$pull: {"items": {"variants": variantData} } })

  ###
  # add payment method
  ###
  paymentMethod: (cartId, paymentMethod) ->
    Cart.update cartId, {$addToSet:{"payment.paymentMethod":paymentMethod}}, (error,result) ->
      result

  ###
  # adjust inventory when an order is placed
  ###
  inventoryAdjust: (orderId) ->
    order = Orders.findOne( {_id: orderId} )
    for product in order.items
      Products.update {_id: product.productId, "variants._id": product.variants._id}, {$inc: {"variants.$.inventoryQuantity": -product.quantity }}
  ###
  # when a payment is processed we want to copy the cart
  # over to an order object, and give the user a new empty
  # cart. reusing the cart schema makes sense, but integrity of
  # the order, we don't want to just make another cart item
  ###
  copyCartToOrder: (cart) ->
    #Retrieving cart twice (once on call)to ensure accurate clone from db
    currentCartId = cart._id
    # cart = Cart.findOne(cartId)
    now = new Date()
    # TODO: Check userId & sessionId against current
    cart.shopId = Meteor.app.getCurrentShop()._id
    cart.userId = Meteor.userId()
    cart.createdAt = now
    cart.updatedAt = now
    cart._id = Random.id()
    cart.state = "orderCreated"
    cart.status = "new"

    order = Orders.insert(cart,
        (error, result) ->
          console.log "error in order insert"
          console.log Orders.namedContext().invalidKeys() if error
      )
    Cart.remove(userId: Meteor.userId)
    return cart._id #new order id

  ###
  # method to add new addresses to a user's profile
  ###
  addressBookAdd: (doc) ->
    check(doc, AddressSchema)
    if doc.isDefault
      Meteor.users.update
        _id: Meteor.userId()
        "profile.addressBook.isDefault": true
      ,
        $set:
          "profile.addressBook.$.isDefault": false
    # Add new address
    doc._id = Random.id()
    Meteor.users.update
      _id: Meteor.userId()
    ,
      $addToSet:
        "profile.addressBook": doc
    this.unblock()

  ###
  #method to update existing address in user's profile
  ###
  addressBookUpdate: (doc) ->
    check(doc, AddressSchema)
    #reset existing default
    if doc.isDefault
      Meteor.users.update
        _id: Meteor.userId()
        "profile.addressBook.isDefault": true
      ,
        $set:
          "profile.addressBook.$.isDefault": false
    # update existing address
    Meteor.users.update
      _id: Meteor.userId()
      "profile.addressBook._id": doc._id
    ,
      $set:
        "profile.addressBook.$": doc
    this.unblock()