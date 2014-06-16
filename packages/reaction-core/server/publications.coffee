# Scope variable import
Shops = @Shops
Products = @Products
Customers = @Customers
Orders = @Orders
Cart  = @Cart
Tags = @Tags
Packages = @Packages
ConfigData = @ConfigData
# FileStorage = @FileStorage
Users = @Users = Meteor.users

###
# Reaction Server / amplify permanent sessions
# If no id is passed we create a new session
# Load the session
# If no session is loaded, creates a new one
###
ServerSessions = new Meteor.Collection("ReactionSessions")
Meteor.publish 'ReactionSessions', (id) ->
  created = new Date().getTime()
  id = ServerSessions.insert(created: created) unless id
  serverSession = ServerSessions.find(id)
  if serverSession.count() is 0
    id = ServerSessions.insert(created: created)
    serverSession = ServerSessions.find(id)
  serverSession


#
# CollectionFS - File Storage permissions
#
Meteor.publish "media", () ->
  return Media.find({ 'metadata.shopId': Meteor.app.getCurrentShop(this)._id },  {sort: {"metadata.priority": 1}})

# Meteor.publish "variantMedia", (variantId) ->
#   return Media.find({ 'metadata.shopId': Meteor.app.getCurrentShop(this)._id },  {sort: {"metadata.priority": 1}})

Media.allow
  insert: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  update: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  remove: (userId, fileObj) ->
    if fileObj.metadata.shopId != Meteor.app.getCurrentShop(this)._id
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  download: (userId, fileObj) ->
    true
  fetch: []

#
# filestorage for generate docs (invoices)
#
Meteor.publish "FileStorage", () ->
  return FileStorage.find()

FileStorage.allow
  insert: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  update: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  remove: (userId, fileObj) ->
    if fileObj.metadata.shopId != Meteor.app.getCurrentShop(this)._id
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  download: (userId, fileObj) ->
    true
  fetch: []

###
# get any user name,social profile image
# should be limited, secure information
###
Meteor.publish "UserProfile", (profileId) ->
  if profileId?
    if Roles.userIsInRole(this.userId, ['dashboard/orders','owner','admin','dashboard/customers'])
      return Users.find _id: profileId,
        fields: 
          profile: 1
          emails: 1
    else
      console.log "user profile access denied"
      return []
  else
    console.log "profileId not defined. access denied"
    return []

###
# Client access rights for ConfigData
###
Meteor.publish 'ConfigData', ->
  ConfigData.find({})

ConfigData.allow
  insert: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  update: (userId, doc, fields, modifier) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true

###
#  Packages contains user specific configuration
#  settings, package access rights
###
Meteor.publish "Packages", ->
  shop = Meteor.app.getCurrentShop(this)
  if shop
    Packages.find
      shopId: shop._id
    ,
      sort:
        priority: 1
  else
    []

###
# Client access rights for reaction_packages
###
Packages.allow
  insert: (userId, doc) ->
    doc.shopId = Meteor.app.getCurrentShop(this)._id
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true

  update: (userId, doc, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true

  remove: (userId, doc) ->
    doc.shopId is Meteor.app.getCurrentShop()._id
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true

###
# shop collection
###
Meteor.publish 'shops', ->
  Meteor.app.getCurrentShopCursor(@)

Meteor.publish 'shopMembers', ->
  self = @
  handle = Meteor.app.getCurrentShopCursor(self).observeChanges
    added: (id) ->
      shop = Shops.findOne id
      memberIds = _.pluck shop.members, "userId"
      Meteor.users.find({_id: {$in: memberIds}}, {fields: {emails: 1, 'profile': 1}}).forEach (user) ->
        self.added("users", user._id, user)
    changed: (id) ->
      shop = Shops.findOne id
      memberIds = _.pluck shop.members, "userId"
      Meteor.users.find({_id: {$in: memberIds}}, {fields: {emails: 1, 'profile': 1}}).forEach (user) ->
        self.added("users", user._id, user)
  self.ready()
  self.onStop ->
    handle.stop()

###
# Client access rights for products
###
Shops.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    true
  update: (userId, doc, fields, modifier) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    doc.owner is userId

###
# product collection
###
Meteor.publish 'products', (userId) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    selector =
      shopId: shop._id
    unless Roles.userIsInRole(this.userId, ['admin'])
      selector.isVisible = true
    Products.find selector
  else
    return []

Meteor.publish 'product', (productId) ->
  shop = Meteor.app.getCurrentShop(@) #todo: wire in shop
  if productId.match  /^[A-Za-z0-9]{17}$/
    return Products.find(productId)
  else
    text = productId.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&")
    return Products.find({handle: { $regex : text, $options:"i" } })

###
# Client access rights for products
###
Products.allow
  insert: (userId, product) ->
    product.shopId = Meteor.app.getCurrentShop()._id
    unless Roles.userIsInRole(userId, ['admin']) n
      return false
    true
  update: (userId, product, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  remove: (userId, product) ->
    if product.shopId != Meteor.app.getCurrentShop()._id
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true

###
# orders collection
###
Meteor.publish 'orders', (userId) ->
  shop = Meteor.app.getCurrentShop(@)
  if Roles.userIsInRole(this.userId, ['admin','owner'])
    return Orders.find shopId: shop._id
  else
    return []

Meteor.publish 'userOrders', (userId) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    return Orders.find
      shopId: shop._id
      userId: this.userId
  else
    return []

###
# Client access rights for orders
###
Orders.allow
  insert: (userId, order) ->
    order.shopId = Meteor.app.getCurrentShop()._id;
    true
  update: (userId, order, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    true
  remove: (userId, order) ->
    if order.shopId != Meteor.app.getCurrentShop()._id
      return false
    if !Roles.userIsInRole(userId, ['owner'])
      return false
    true

###
# cart collection
###
Meteor.publish 'cart', (sessionId, userId) ->
  check(sessionId, String)
  currentCart = Cart.find sessionId: sessionId, userId: this.userId
  if this.userId
    userCarts = Cart.find(userId: this.userId)
    # console.log "cartCount:", userCarts.count()
    if userCarts.count() >= 1
      Meteor.call "createCart", sessionId, this.userId
      Meteor.call "syncCarts", this.userId
      return Cart.find sessionId: sessionId, userId: this.userId
    else
      Meteor.call "createCart", sessionId, this.userId
      return Cart.find sessionId: sessionId, userId: this.userId

  return currentCart

###
# Client access rights for cart
###
Cart.allow
  insert: (userId, cart) ->
    cart.shopId = Meteor.app.getCurrentShop()._id
    true
  update: (userId, cart, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    true
  remove: (userId, cart) ->
    if cart.shopId != Meteor.app.getCurrentShop()._id
      console.log "faslse shopid"
      return false
    if cart.owner != userId
      console.log "falsse cart owner"
      return false
    true

###
# tags
###
Meteor.publish "tags", ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    return Tags.find shopId: shop._id
  else
    return []

Tags.allow
  insert: (userId, tag) ->
    tag.shopId = Meteor.app.getCurrentShop()._id
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  update: (userId, tag, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
  remove: (userId, tag) ->
    # if tag.shopId != Meteor.app.getCurrentShop()._id
    #   return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    true
