# *****************************************************
# product collection
# *****************************************************

Meteor.publish 'products', ->
  @Products.find()

Meteor.publish 'product', (id) ->
  @Products.findOne(id)

# *****************************************************
# Client access rights for products
# *****************************************************
@Products.allow
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
  @Orders.find()

Meteor.publish 'order', (id) ->
  @Orders.findOne(id)

# *****************************************************
# Client access rights for orders
# *****************************************************
@Orders.allow
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
  @Customers.find()

Meteor.publish 'customer', (id) ->
  @Customers.findOne(id)

# *****************************************************
# Client access rights for customers
# *****************************************************
@Customers.allow
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



