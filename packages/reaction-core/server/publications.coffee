# Scope variable import
Shops = @Shops
Products = @Products
Customers = @Customers
Orders = @Orders
Cart  = @Cart
Tags = @Tags
Packages = @Packages
ConfigData = @ConfigData
FileStorage = @FileStorage
Users = @Users = Meteor.users

###
#  Packages contains user specific configuration
#  settings, package access rights
###
Meteor.publish "Packages", ->
  shop = Meteor.app.getCurrentShop(this)
  if shop
    Packages.find
      shopId: Meteor.app.getCurrentShop(this)._id
    ,
      sort:
        priority: 1

Meteor.publish 'ConfigData', ->
  ConfigData.find({})

Meteor.publish "FileStorage", (id) ->
  FileStorage.find _id: id

FileStorage.allow
  insert: (userId, doc) ->
    doc.shopId = Meteor.app.getCurrentShop()._id
    true

  update: (userId, doc, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      return false
    true

  remove: (userId, doc) ->
    doc.shopId is Meteor.app.getCurrentShop()._id

###
# get any user name,social profile image
# should be limited, secure information
###
Meteor.publish "UserProfile", (profileId) ->
  if Roles.userIsInRole(this.userId, ['dashboard/orders','owner','admin','dashboard/customers'])
    cursor = Users.find
      _id: profileId
    ,
      fields:
        profile: 1
        emails: 1
  else
    return false

###
# Client access rights for ConfigData
###
ConfigData.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    #return (userId && doc.owner === userId);
    true
  update: (userId, doc, fields, modifier) ->
    # can only change your own documents
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    # can only remove your own documents
    doc.owner is userId

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

###
# Client access rights for reaction_packages
###
Packages.allow
  insert: (userId, doc) ->
    doc.shopId = Meteor.app.getCurrentShop()._id
    true

  update: (userId, doc, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      return false
    true

  remove: (userId, doc) ->
    doc.shopId is Meteor.app.getCurrentShop()._id

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
    # can only change your own documents
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    # can only remove your own documents
    doc.owner is userId

###
# product collection
###
Meteor.publish 'products', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    selector =
      shopId: shop._id
    if !Roles.userIsInRole(this.userId, ['admin'])
      selector.isVisible = true
    Products.find selector
    # , {sort:{updatedAt: -1}}

Meteor.publish 'product', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Products.findOne _id: id, shopId: shop._id

###
# Client access rights for products
###
Products.allow
  insert: (userId, product) ->
    product.shopId = Meteor.app.getCurrentShop()._id;
    if !Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    true
  update: (userId, product, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    if !Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    true
  remove: (userId, product) ->
    if product.shopId != Meteor.app.getCurrentShop()._id
      return false
    if !Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    true

###
# orders collection
###
Meteor.publish 'orders', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Orders.find shopId: shop._id

Meteor.publish 'order', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Orders.findOne _id: id, shopId: shop._id

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
    if !Roles.userIsInRole(Meteor.userId(), ['owner'])
      return false
    true

###
# customers collection
###

Meteor.publish 'customers', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Customers.find shopId: shop._id

Meteor.publish 'customer', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Customers.findOne _id: id, shopId: shop._id

###
# Client access rights for customers
###
Customers.allow
  insert: (userId, customer) ->
    customer.shopId = Meteor.app.getCurrentShop()._id;
    true
  update: (userId, customer, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    true
  remove: (userId, customer) ->
    if customer.shopId != Meteor.app.getCurrentShop()._id
      return false
    if !Roles.userIsInRole(Meteor.userId(), ['admin'])
      return false
    true

###
# cart collection
###
Meteor.publish 'cart', (sessionId,userId) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Cart.find shopId: shop._id, sessionId: sessionId

###
# Client access rights for cart
###
Cart.allow
  insert: (userId, cart) ->
    cart.shopId = Meteor.app.getCurrentShop()._id;
    true
  update: (userId, cart, fields, modifier) ->
    if modifier.$set && modifier.$set.shopId
      return false
    true
  remove: (userId, cart) ->
    if cart.shopId != Meteor.app.getCurrentShop()._id
      return false
    if cart.owner != userId
      return false
    true

###
# tags
###
Meteor.publish "tags", ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Tags.find shopId: shop._id

Tags.allow
  insert: (userId, tag) ->
    tag.shopId = Meteor.app.getCurrentShop()._id
    true
  update: (userId, tag, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      false
    true
  remove: (userId, tag) ->
    if tag.shopId != Meteor.app.getCurrentShop()._id
      return false
