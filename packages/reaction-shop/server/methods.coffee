Future = Npm.require('fibers/future')
Meteor.methods
  inviteShopMember: (shopId, email, name) ->
    shop = Shops.findOne shopId
    if shop and email and name
      userId = Accounts.createUser
        email: email
        profile:
          name: name
      Shops.update shopId, {$addToSet: {members: {userId: userId, isAdmin: true}}}

      user = Meteor.users.findOne(userId)
      unless user
        throw new Error("Can't find user")
      token = Random.id()
      Meteor.users.update userId,
        $set:
          "services.password.reset":
            token: token
            email: email
            when: new Date()

      currentUserName = Meteor.user().profile.name
      Email.send
        to: email
        from: currentUserName + " <robot@reaction.com>"
        subject: "[Shopify] You have been invited to join the " + shop.name + " staff"
        html: Handlebars.templates['shopMemberInvite']
          homepage: Meteor.absoluteUrl()
          shop: shop
          currentUserName: currentUserName
          invitedUserName: name
          url: Accounts.urls.enrollAccount(token)

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

  locateAddress: (latitude,longitude) ->
    Future = Npm.require('fibers/future')
    geocoder = Npm.require('node-geocoder')
    fut = new Future()
    locateCoord = geocoder.getGeocoder('google', 'http')
    locateIP = geocoder.getGeocoder('freegeoip', 'http')
    # default location if nothing found is US
    address = [{
      latitude: null,
      longitude: null,
      country: 'United States',
      city: null,
      state: null,
      stateCode: null,
      zipcode: null,
      streetName: null,
      streetNumber: null,
      countryCode: 'US'
    }]

    if latitude
      locateCoord.reverse latitude, longitude, (err, address) ->
        fut['return'](address)
    else
      ip = headers.methodClientIP(this)
      #ip = "76.168.14.229"
      locateIP.geocode ip, (err, address) ->
        fut['return'](address)

    address = fut.wait() if fut.wait()
    address = address[0]
    return address
