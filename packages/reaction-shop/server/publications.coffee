Meteor.publish 'staff', ->
  shop = Shops.findOne domains: getDomain(this)
  if shop
    Meteor.users.find {'shopRoles.shopId': shop._id}

# *****************************************************
# product collection
# *****************************************************

# Scope variable import
Shops = @Shops
Products = @Products
Customers = @Customers
Orders = @Orders

getDomain = (client) ->
  get_http_header(client, 'host').split(':')[0]

Meteor.publish 'shops', ->
  Shops.find domains: getDomain(this)

Meteor.publish 'products', ->
  shop = Shops.findOne domains: getDomain(this)
  if shop
    Products.find shopId: shop._id

Meteor.publish 'product', (id) ->
  shop = Shops.findOne domains: getDomain(this)
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
  shop = Shops.findOne domains: getDomain(this)
  if shop
    Orders.find shopId: shop._id

Meteor.publish 'order', (id) ->
  shop = Shops.findOne domains: getDomain(this)
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
  shop = Shops.findOne domains: getDomain(this)
  if shop
    Customers.find shopId: shop._id

Meteor.publish 'customer', (id) ->
  shop = Shops.findOne domains: getDomain(this)
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



