Future = Npm.require('fibers/future')

#
# setting defaults of mail from shop configuration
#
setMailUrlForShop = (shop) ->
  mailgun = Packages.findOne({shopId:shop._id, name:'reaction-mailgun'})
  sCES = null
  if mailgun and mailgun.settings
    sCES = mailgun.settings
  else
    if shop.useCustomEmailSettings
      sCES = shop.customEmailSettings

  if sCES
      process.env.MAIL_URL = "smtp://" + sCES.username + ":" + sCES.password + "@" + sCES.host + ":" + sCES.port + "/"

Meteor.methods

  #
  # this method is to invite new admin users
  # (not consumers) to secure access in the dashboard
  # to permissions as specified in packages/roles
  #
  inviteShopMember: (shopId, email, name) ->
    shop = Shops.findOne shopId
    if shop and email and name
      if Meteor.app.hasOwnerAccess(shop)
        currentUserName = Meteor.user().profile.name
        user = Meteor.users.findOne {"emails.address": email}
        unless user # user does not exist, invite him
          userId = Accounts.createUser
            email: email
            profile:
              name: name
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

          setMailUrlForShop(shop)
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "[Reaction] You have been invited to join the " + shop.name + " staff"
            html: Handlebars.templates['shopMemberInvite']
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name
              url: Accounts.urls.enrollAccount(token)
        else # user exist, send notification
          setMailUrlForShop(shop)
          Email.send
            to: email
            from: currentUserName + " <" + shop.email + ">"
            subject: "[Reaction] You have been invited to join the " + shop.name + " staff"
            html: Handlebars.templates['shopMemberNotification']
              homepage: Meteor.absoluteUrl()
              shop: shop
              currentUserName: currentUserName
              invitedUserName: name

        Shops.update shopId, {$addToSet: {members: {userId: user._id, isAdmin: true}}}

  #
  # this method sends an email to consumers on sign up
  #
  sendWelcomeEmail: (shop) ->
    email = Meteor.user().emails[0].address
    setMailUrlForShop(shop)
    Email.send
      to: email
      from: shop.email
      subject: "[Reaction] Welcome to " + shop.name + "!"
      html: Handlebars.templates['memberWelcomeNotification']
        homepage: Meteor.absoluteUrl()
        shop: shop

  #
  # when we add a new variant, we clone the last one
  #
  cloneVariant: (id, clone) ->
    clone._id = Random.id()
    Products._collection.update({_id:id}, {$push: {variants: clone}})
    clone._id

  #
  # update individual variant with new values, merges into original
  # only need to supply updated information
  #
  updateVariant: (variant) ->
    product = Products.findOne "variants._id":variant._id
    for variants,value in product.variants
      if variants._id is variant._id
        newVariant = _.extend variants,variant
    #TODO: check newVariant, ProductVariantSchema
    Products._collection.update({_id:product._id,"variants._id":variant._id}, {$set: {"variants.$": newVariant}})

  #
  # update whole variants array
  #
  updateVariants: (variants) ->
    product = Products.findOne "variants._id":variants[0]._id
    Products.update product._id, $set: variants: variants,(error,results) ->
      console.log error if error?

  #
  # clone a whole product, defaulting visibility,etc
  # in the future we are going to do an inheritance product
  # that maintains relationships with the cloned
  # product tree
  #
  cloneProduct: (product) ->
    #TODO: Really should be a recursive update of all _id
    i = 0
    product._id = Random.id()
    delete product.updatedAt
    delete product.createdAt
    delete product.publishedAt
    product.isVisible = false
    while i < product.variants.length
      product.variants[i]._id = Random.id()
      i++
    newProduct = Products._collection.insert(product)

  #
  # when we create a new product, we create it with
  # an empty variant. all products have a variant
  # with pricing and details
  #
  createProduct: () ->
    productId = Products._collection.insert({
      _id: Random.id()
      title: ""
      variants: [
        {
          _id: Random.id()
          title: ""
          price: 0.00
        }
      ]
    })

  #
  # update product grid positions
  # position is an object with tag,position,dimensions
  #
  updateProductPosition: (productId,positionData) ->
    unless Products.findOne({'_id' :productId,"positions.tag":positionData.tag})
      Products._collection.update {_id: productId},
        {$addToSet:{ positions:positionData },$set:{updatedAt:new Date() } },
      , (error,results) ->
        console.log error if error
    else
      #Collection2 doesn't support elemMatch, use core collection
      Products._collection.update
        "_id": productId
        "positions.tag": positionData.tag
        ,
          $set:
            "positions.$.position": positionData.position
            "updatedAt": new Date()
        ,
          (error,results) ->
            console.log error if error?

  # when we add an item to the cart, we want to break all relationships
  # with the existing item. We want to fix price, qty, etc into history
  # however, we could check reactively for price /qty etc, adjustments on
  # the original and notify them
  #
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

  #
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
  #
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

  removeFromCart: (cartId, variantData) ->
    Cart.update({_id: cartId}, {$pull: {"items": {"variants": variantData} } })

  #
  # when a payment is processed we want to copy the cart
  # over to an order object, and give the user a new empty
  # cart. reusing the cart schema makes sense, but integrity of
  # the order, we don't want to just make another cart item
  #
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

  #
  # method to add new addresses to a user's profile
  #
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

  #
  #method to update existing address in user's profile
  #
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

  #
  # method to determine user's location for autopopulating addresses
  #
  locateAddress: (latitude, longitude) ->
    Future = Npm.require("fibers/future")
    geocoder = Npm.require("node-geocoder")
    future = new Future()
    if latitude
      locateCoord = geocoder.getGeocoder("google", "http")
      locateCoord.reverse latitude, longitude, (err, address) ->
        if err then Meteor._debug(err)
        future.return(address)
    else
      ip = headers.methodClientIP(@)
      locateIP = geocoder.getGeocoder("freegeoip", "http")
      #ip = "76.168.14.229"
      locateIP.geocode ip, (err, address) ->
        if err then Meteor._debug(err)
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

