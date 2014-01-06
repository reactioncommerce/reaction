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

  cloneVariant: (id, clone) ->
    Products._collection.update(id, {$push: {variants: clone}})

  cloneProduct: (product) ->
    #TODO: Really should be a recursive update of all _id
    i = 0
    delete product._id
    delete product.updatedAt
    delete product.createdAt
    delete product.publishedAt
    product.isVisible = false
    while i < product.variants.length
      product.variants[i]._id = Random.id()
      i++
    newProduct = Products._collection.insert(product)

  createProduct: () ->
    productId = Products._collection.insert({
      title: ""
      variants: [
        {
          title: ""
          price: 0.00
        }
      ]
    })

  addToCart: (cartId, productId, variantData, quantity) ->
    now = new Date()
    currentCart = Cart.find({_id: cartId, "items.variants._id": variantData._id})
    validationContext = "cart"
    if currentCart.count() > 0
      Cart.update {_id: cartId, "items.variants._id": variantData._id}, { $set: {updatedAt: now}, $inc: {"items.$.quantity": quantity}}
    else
      Cart.update {_id: cartId}, { $addToSet: {items: {productId: productId, quantity: quantity, variants: variantData}}},validationContext: validationContext, (error, result) -> console.log Cart.namedContext("cart").invalidKeys()  if Cart.namedContext("cart").invalidKeys().length > 0

  createCart: (sessionId, userId) ->
    unless userId
      userId = Meteor.userId()
    now = new Date()
    validationContext = "cart"
    if Cart.findOne({sessionId: sessionId, userId: userId})
      currentCart = Cart.findOne({sessionId: sessionId, userId: userId})
    else
      currentCart = Cart.findOne({sessionId: sessionId})
      if userId
        Cart.update({sessionId: sessionId}, {$set: {userId: userId}})
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

  removeFromCart: (cartId, variantData) ->
    Cart.update({_id: cartId}, {$pull: {"items": {"variants": variantData} } })

  addAddress: (doc) ->
    doc._id = Random.id()
    Meteor.users.update({_id: Meteor.userId()}, {$addToSet: {"profile.addressList": doc}})

  locateAddress: (latitude, longitude) ->
    Future = Npm.require("fibers/future")
    geocoder = Npm.require("node-geocoder")
    future = new Future()
    if latitude
      locateCoord = geocoder.getGeocoder("google", "http")
      locateCoord.reverse latitude, longitude, (err, address) ->
        future.return(address)
    else
      ip = headers.methodClientIP(@)
      locateIP = geocoder.getGeocoder("freegeoip", "http")
      #ip = "76.168.14.229"
      locateIP.geocode ip, (err, address) ->
        future.return(address)

    address = future.wait()
    if address.length
      address[0]
    else # default location if nothing found is US
      {
        latitude: null
        longitude: null
        country: "United States"
        city: null
        state: null
        stateCode: null
        zipcode: null
        streetName: null
        streetNumber: null
        countryCode: "US"
      }
