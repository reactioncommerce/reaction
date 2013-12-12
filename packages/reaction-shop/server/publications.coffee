Meteor.publish 'staff', ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Meteor.users.find {'shopRoles.shopId': shop._id}

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
  Meteor.app.getCurrentShopCursor(this)

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
    Products.find shopId: shop._id

Meteor.publish 'product', (id) ->
  shop = Meteor.app.getCurrentShop(@)
  if shop
    Products.findOne _id: id, shopId: shop._id

# *****************************************************
# Client access rights for products
# *****************************************************
Products.allow
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
    # can only remove your own documents
    doc.owner is userId
  #fetch: ['owner']


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
    # can only remove your own documents
    doc.owner is userId
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
