# Scope variable import
Shops = @Shops
Products = @Products
Customers = @Customers
Orders = @Orders
Cart  = @Cart
Tags = @Tags

# *****************************************************
# shop collection
# *****************************************************

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

# *****************************************************
# Client access rights for products
# *****************************************************
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
  #fetch: ['owner']

# *****************************************************
# product collection
# *****************************************************

Meteor.publish 'products', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    selector =
      shopId: shop._id
    if !Roles.userIsInRole(this.userId, ['admin'])
      selector.isVisible = true
    Products.find selector

Meteor.publish 'product', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Products.findOne _id: id, shopId: shop._id

# *****************************************************
# Client access rights for products
# *****************************************************
Products.allow
  insert: (userId, doc) ->
    true if Roles.userIsInRole(Meteor.userId(), ['admin'])
  update: (userId, doc, fields, modifier) ->
    true if Roles.userIsInRole(Meteor.userId(), ['admin'])
  remove: (userId, doc) ->
    true if Roles.userIsInRole(Meteor.userId(), ['admin'])


# *****************************************************
# orders collection
# *****************************************************

Meteor.publish 'orders', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Orders.find shopId: shop._id

Meteor.publish 'order', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Orders.findOne _id: id, shopId: shop._id

# *****************************************************
# Client access rights for orders
# *****************************************************
Orders.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    #return (userId && doc.owner === userId);
    true
  update: (userId, doc, fields, modifier) ->
    # can only change your own documents
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    true if Roles.userIsInRole(Meteor.userId(), ['owner'])

# *****************************************************
# customers collection
# *****************************************************

Meteor.publish 'customers', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Customers.find shopId: shop._id

Meteor.publish 'customer', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Customers.findOne _id: id, shopId: shop._id

# *****************************************************
# Client access rights for customers
# *****************************************************
Customers.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    #return (userId && doc.owner === userId);
    true
  update: (userId, doc, fields, modifier) ->
    # can only change your own documents
    true
    #return doc.owner === userId;
  remove: (userId, doc) ->
    true if Roles.userIsInRole(Meteor.userId(), ['admin'])
  #fetch: ['owner']


# *****************************************************
# cart collection
# *****************************************************

Meteor.publish 'cart', (sessionId) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Cart.find shopId: shop._id, sessionId: sessionId

# *****************************************************
# Client access rights for cart
# *****************************************************
Cart.allow
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
  #fetch: ['owner']

Meteor.publish "tags", ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Tags.find shopId: shop._id

Tags.allow
  insert: (userId, doc) ->
    doc.shopId = Meteor.app.getCurrentShop()._id
    true
  update: (userId, doc, fields, modifier) ->
    if modifier.$set and modifier.$set.shopId
      false
    true
  remove: (userId, doc) ->
    doc.shopId is Meteor.app.getCurrentShop()._id
