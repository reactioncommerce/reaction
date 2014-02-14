Meteor.methods
  ###
  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  ###
  addToCart: (cartSession, productId, variantData, quantity) ->
    # make sure a cart has been created
    unless Cart.findOne(cartSession)?
      cart = Meteor.call "createCart", cartSession

    if cartSession
      cartVariantExists = Cart.findOne
        sessionId: cartSession.sessionId,
        userId: cartSession.userId,
        "items.variants._id": variantData._id
      #If updating existing item, increment quantity
      if cartVariantExists
        Cart.update
          sessionId: cartSession.sessionId
          userId: cartSession.userId
          "items.variants._id": variantData._id,
          { $set: {updatedAt: new Date()}, $inc: {"items.$.quantity": quantity}},
        (error, result) ->
          console.log Cart.namedContext().invalidKeys() if error?
      # add new cart items
      else
        Cart.update cartSession,
          $addToSet:
            items:
              _id: productId
              quantity: quantity
              variants: variantData
        , (error, result) ->
          console.log error if error?

  ###
  # create a new cart
  # or move an existing sesssion to the current logged in user
  # make sure that personal data isn't transfered to new user,
  # but they can keep the cart items
  #
  # runs on autorun, as well as at add to cart
  #
  # 1. new carts for guest (no user id)
  # 2. carts owned by guest but different sessions should be merged
  # 3. browser session that logs out of account and into new account should get
  #    a) cleansed cart information, but retain items
  #    b) load any existing carts, but don't increase product qty
  ###
  createCart: (cartSession) ->
    if cartSession.sessionId
      now = new Date()
      sessionId = cartSession.sessionId
      shopId =  Meteor.app.getCurrentShop()._id
      userId = cartSession.userId
      #Clean user details if user not logged in
      unless userId?
        Cart.update({sessionId: sessionId}, {$unset: {userId: 1, shipping: 1, payment: 1}} )
      #template for empty cart
      emptyCart =
        shopId: shopId
        sessionId: sessionId
        userId: userId
        createdAt: now
        updatedAt: now,
        state: "new"
      # find carts with matching session id
      sessionCart = Cart.findOne(cartSession)
      # find cart(s) for current user and not this session
      userCarts =  Cart.find( {userId: userId, shopId:shopId,sessionId:{$ne:sessionId}}).fetch() if userId
      defaultCart = _.extend emptyCart,sessionCart unless sessionCart?
      # merge them
      # TODO: add session to user data, and reuse session to get synching of logged in accounts
      # TODO: move this to after upsert, and use add to cart functional, to increment qty
      if userCarts and defaultCart
        userCartItems = new Array
        for cart in userCarts
          userCartItems.push items for items in cart.items if cart?.items
        (defaultCart.items = userCartItems) if userCartItems?.length > 0
      #only create if we're not in an session cart
      unless sessionCart?
        Cart.upsert {sessionId: sessionId, shopId:shopId}, {$set:defaultCart}, (error, result) ->
            console.log error if error
            Deps.flush() if result?.insertedId
      else
        return sessionCart
  ###
  # removes a variant from the cart
  ###
  removeFromCart: (cartId, variantData) ->
    Cart.update({_id: cartId}, {$pull: {"items": {"variants": variantData} } })

  ###
  # adjust inventory when an order is placed
  ###
  inventoryAdjust: (orderId) ->
    order = Orders.findOne( {_id: orderId} )
    for product in order.items
      Products.update {_id: product._id,"variants._id": product.variants._id}, {$inc: {"variants.$.inventoryQuantity": -product.quantity }}
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
    cart.status = "new"

    order = Orders.insert(cart,
        (error, result) ->
          console.log Orders.namedContext().invalidKeys() if error
      )
    Cart.remove(currentCartId)
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