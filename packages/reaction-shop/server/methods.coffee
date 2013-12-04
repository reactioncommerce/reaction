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
    #TODO: Meteor.call('createCart',sessionId,productId,variantData) so this can be a single call
    currentCart = Cart.find({_id: cartId, "items.variants._id": variantData._id})

    if currentCart.count() > 0
      Cart.update {_id: cartId, "items.variants._id": variantData._id},{ $set: {updatedAt: now}, $inc: {"items.$.quantity": quantity}}
    else
      Cart.update {_id: cartId},{ $addToSet:{items:{productId: productId, quantity: quantity, variants: variantData}}}

  createCart: (sessionId,productId,variantData) ->
    now = new Date()
    validationContext = "cart"
    currentCart = Cart.findOne()
    # If user doesn't have a cart, create one
    #console.log currentCart
    if currentCart is `undefined`
      currentCart = Cart.insert(
        shopId: Meteor.app.getCurrentShop()._id
        sessionId: sessionId
        userId: Meteor.userId()
        createdAt: now
        updatedAt: now,
        validationContext: validationContext,
        (error, result) ->
        console.log Cart.namedContext("cart").invalidKeys()  if Cart.namedContext("cart").invalidKeys().length > 0
      )
    return currentCart