Future = Npm.require('fibers/future')
Meteor.methods
  inviteShopMember: (shopId, email, name, role) ->
    shop = Shops.findOne shopId
    if shop and email and name and role
      userId = Accounts.createUser
        email: email
        profile:
          name: name
      Meteor.users.update userId, {$set: {shopRoles: [{shopId: shopId, name: role}]}}
      Accounts.sendEnrollmentEmail(userId)

  addToCart: (cartId,productId,variantData,quantity) ->
    now = new Date()
    currentCart = Cart.find({_id: cartId, "items.variants._id": variantData._id})

    if currentCart.count() > 0
      Cart.update {_id: cartId, "items.variants._id": variantData._id},{ $set: {updatedAt: now}, $inc: {"items.$.quantity": quantity}}
    else
      Cart.update {_id: cartId},{ $addToSet:{items:{productId: productId, quantity: quantity, variants: variantData}}}

  createCart: (sessionId,userId) ->
    unless userId
      userId = Meteor.userId()
    now = new Date()
    validationContext = "cart"
    if Cart.findOne({sessionId:sessionId,userId:userId})
      currentCart = Cart.findOne({sessionId:sessionId,userId:userId})
    else
      currentCart = Cart.findOne({sessionId:sessionId})
      if userId
        Cart.update({sessionId:sessionId},{$set:{userId:userId}})
    # If user doesn't have a cart, create one
    if currentCart is `undefined`
      currentCart = Cart.insert(
        shopId: Meteor.app.getCurrentShop()._id
        sessionId: sessionId
        userId: userId
        createdAt: now
        updatedAt: now,
        validationContext: validationContext,
        (error, result) ->
        console.log Cart.namedContext("cart").invalidKeys()  if Cart.namedContext("cart").invalidKeys().length > 0
      )
    return currentCart

  removeFromCart: (cartId,variantData) ->
     Cart.update({_id: cartId},{$pull: {"items": {"variants": variantData} } })

  addAddress: (doc) ->
    doc._id = new Meteor.Collection.ObjectID()._str
    Meteor.users.update({_id: Meteor.userId()}, {$addToSet:{"profile.addressList":doc}})

  locateAddress: (lat,long) ->
    # future = Npm.require('fibers/future')
    fut = new Future()
    gm = Npm.require("googlemaps")
    util = Npm.require("util")
    location = gm.reverseGeocode gm.checkAndConvertPoint([lat, long]), (err, data) ->
      fut['return'](data)
    return fut.wait()