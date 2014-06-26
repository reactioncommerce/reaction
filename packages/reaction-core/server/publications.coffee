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
  return serverSession


#
# CollectionFS - File Storage permissions
#
Meteor.publish "media", () ->
  return Media.find({ 'metadata.shopId': Meteor.app.getCurrentShop(this)._id },  {sort: {"metadata.priority": 1}})

Media.allow
  insert: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  update: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  remove: (userId, fileObj) ->
    if fileObj.metadata.shopId != Meteor.app.getCurrentShop(this)._id
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  download: (userId, fileObj) ->
    return true
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
    return true
  update: (userId, fileObj) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  remove: (userId, fileObj) ->
    if fileObj.metadata.shopId != Meteor.app.getCurrentShop(this)._id
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  download: (userId, fileObj) ->
    return true
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
  return ConfigData.find()

ConfigData.allow
  insert: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  update: (userId, doc, fields, modifier) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true

###
#  Packages contains user specific configuration
#  settings, package access rights
###
Meteor.publish "Packages", ->
  shop = Meteor.app.getCurrentShop(this)
  if shop
    return Packages.find
      shopId: shop._id
    ,
      sort:
        priority: 1
  else
    return []

###
# Client access rights for reaction_packages
###
Packages.allow
  insert: (userId, doc) ->
    doc.shopId = Meteor.app.getShopId(@)
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true

  update: (userId, doc, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true

  remove: (userId, doc) ->
    doc.shopId is Meteor.app.getShopId()
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true

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
  return

###
# Client access rights for products
###
Shops.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    return userId and doc.ownerId is userId
  update: (userId, doc, fields, modifier) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return doc.ownerId is userId
  remove: (userId, doc) ->
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return doc.ownerId is userId

###
# product collection
###
Meteor.publish 'products', (userId) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    selector = {shopId: shop._id}
    unless Roles.userIsInRole(this.userId, ['admin'])
      selector.isVisible = true
    return Products.find(selector)
  else
    return []

Meteor.publish 'product', (productId) ->
  shop = Meteor.app.getCurrentShop(@) #todo: wire in shop
  if productId.match /^[A-Za-z0-9]{17}$/
    return Products.find(productId)
  else
    return Products.find({handle: { $regex : productId, $options:"i" } })

###
# Client access rights for products
###
Products.allow
  insert: (userId, product) ->
    product.shopId = Meteor.app.getShopId()
    unless Roles.userIsInRole(userId, ['admin']) n
      return false
    return true
  update: (userId, product, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  remove: (userId, product) ->
    if product.shopId != Meteor.app.getShopId()
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true

###
# orders collection
###
Meteor.publish 'orders', ->
  if Roles.userIsInRole(this.userId, ['admin','owner'])
    return Orders.find( shopId: Meteor.app.getShopId(@) )
  else
    return []

Meteor.publish 'userOrders', (userId) ->
  return Orders.find
    shopId: Meteor.app.getShopId(@)
    userId: this.userId

###
# Client access rights for orders
###
Orders.allow
  insert: (userId, order) ->
    order.shopId = Meteor.app.getShopId()
    return true
  update: (userId, order, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    return true
  remove: (userId, order) ->
    if order.shopId isnt Meteor.app.getShopId()
      return false
    unless Roles.userIsInRole(userId, ['owner'])
      return false
    return true

###
# cart collection
###
Meteor.publish 'cart', (sessionId) ->
  check(sessionId, String)
  userId = @userId

  if userId
    cartCount = Cart.find(userId: userId).count()
    # console.log "cartCount:", cartCount
    Meteor.call("createCart", sessionId, userId)
    Meteor.call("syncCarts", this.userId) if cartCount > 0

  return Cart.find sessionId: sessionId, userId: userId

###
# Client access rights for cart
###
Cart.allow
  insert: (userId, cart) ->
    cart.shopId = Meteor.app.getShopId()
    return cart.userId is userId
  update: (userId, cart, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    return cart.userId is userId
  remove: (userId, cart) ->
    if cart.shopId isnt Meteor.app.getShopId()
      return false
    return cart.userId is userId

###
# tags
###
Meteor.publish "tags", ->
  return Tags.find(shopId: Meteor.app.getShopId())

Tags.allow
  insert: (userId, tag) ->
    tag.shopId = Meteor.app.getShopId()
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  update: (userId, tag, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
  remove: (userId, tag) ->
    # if tag.shopId != Meteor.app.getCurrentShop()._id
    #   return false
    unless Roles.userIsInRole(userId, ['admin'])
      return false
    return true
