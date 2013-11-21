# *****************************************************
# product collection
# *****************************************************

# Scope variable import
Shops = @Shops
Products = @Products
Customers = @Customers
Orders = @Orders

Meteor.publish 'shops', (domain) ->
  Shops.find {domain: domain}

Meteor.publish 'products', (shopId) ->
  Products.find {shopId: shopId}

Meteor.publish 'product', (id, shopId) ->
  Products.findOne {_id: id, shopId: shopId}

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
  Orders.find {shopId: shopId}

Meteor.publish 'order', (id) ->
  Orders.findOne(id)

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
  Customers.find {shopId: shopId}

Meteor.publish 'customer', (id) ->
  Customers.findOne(id)

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



