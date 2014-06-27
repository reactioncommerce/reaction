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
# Generic Security Rule Manager
###

addAllowFuncForAll = (collections, types, fetch, func) ->
  rules = {fetch: fetch}
  _.each types, (t) ->
    rules[t] = func
  _.each collections, (c) ->
    c.allow rules

addDenyFuncForAll = (collections, types, fetch, func) ->
  rules = {fetch: fetch}
  _.each types, (t) ->
    rules[t] = func
  _.each collections, (c) ->
    c.deny rules

Security =
  # This one should be called for any collections you don't explicitly call allow on because one allow function is required
  defaultAllow: (collections) ->
    addAllowFuncForAll collections, ["insert", "update", "remove"], [], (userId) ->
      return true
  # For FS.Collections only, allows downloads for any user, even if not logged in
  allowAnonymousFileDownloads: (collections) ->
    addAllowFuncForAll collections, ["download"], [], (userId) ->
      return true
  # Allow inserts, updates, and removes only if the user is in one of the given roles 
  allowOnlyRoles: (roles, types, collections) ->
    addDenyFuncForAll collections, types, [], (userId) ->
      return !Roles.userIsInRole(userId, roles)
  # Allow updates and removes only if doc.shopId matches the current shop
  mustMatchShop: (collections) ->
    addDenyFuncForAll collections, ["update", "remove"], ["shopId"], (userId, doc) ->
      return doc.shopId isnt Meteor.app.getShopId()
  # Allow updates only if doc.shopId is not being changed
  cantChangeShop: (collections) ->
    addDenyFuncForAll collections, ["update"], [], (userId, doc, fields, modifier) ->
      return !!modifier.$set?.shopId
  # Allow inserts, updates, and removes only if doc.userId matches the current userId
  mustMatchUser: (collections) ->
    addDenyFuncForAll collections, ["insert", "update", "remove"], ["userId"], (userId, doc) ->
      return doc.userId isnt userId
  # Allow inserts, updates, and removes only if fileObj.metadata.shopId matches the current shop
  fileMustBelongToShop: (collections) ->
    addDenyFuncForAll collections, ["insert", "update", "remove"], [], (userId, fileObj) ->
      return fileObj.metadata.shopId isnt Meteor.app.getShopId(@)
  

###
# Method to Auto-Set Props on Insert
###

AutoSet = (prop, collections, valFunc) ->
  _.each collections, (c) ->
    c.deny
      # Set prop on insert
      insert: (userId, doc) ->
        doc[prop] = valFunc()
        return false
      fetch: []

AutoSet "shopId", [ Packages, Orders, Cart, Tags ], ->
  return Meteor.app.getShopId()

###
# We add some common security rules through simple Security methods
###

Security.defaultAllow [ Media, FileStorage, ConfigData, Packages, Products, Orders, Cart, Tags ]

Security.allowOnlyRoles ['admin'], ["insert", "update", "remove"], [ Media, FileStorage, ConfigData, Products, Tags ]

Security.allowOnlyRoles ['admin'], ["update", "remove"], [ Shops ]

Security.allowOnlyRoles ['owner'], ["remove"], [ Orders ]

Security.mustMatchShop [ Packages, Products, Orders, Cart, Tags ]

Security.cantChangeShop [ Packages, Products, Orders, Cart, Tags ]

Security.mustMatchUser [ Cart ]

Security.fileMustBelongToShop [ Media, FileStorage ] 

Security.allowAnonymousFileDownloads [ Media, FileStorage ] #todo: allowing anonymous for FileStorage is probably not correct

###
# Extra client access rights for shops
# XXX These should be verified and might be able to be folded into Security above
###
Shops.allow
  insert: (userId, doc) ->
    # the user must be logged in, and the document must be owned by the user
    return userId and doc.ownerId is userId
  update: (userId, doc, fields, modifier) ->
    return doc.ownerId is userId
  remove: (userId, doc) ->
    return doc.ownerId is userId
  fetch: ["ownerId"]

###
# Beyond this point is publication functions
###

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

###
# CollectionFS - Image/Video Publication
###
Meteor.publish "media", () ->
  return Media.find({ 'metadata.shopId': Meteor.app.getShopId(@) }, {sort: {"metadata.priority": 1}})

###
# CollectionFS - Generated Docs (invoices) Publication
###
Meteor.publish "FileStorage", () ->
  #todo: this should be more secure and more filtered
  return FileStorage.find()

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
# cart collection
###
Meteor.publish 'cart', (sessionId) ->
  check(sessionId, String)

  # createCart will create for session if necessary, update user if necessary,
  # and sync all user's carts
  Meteor.call "createCart", sessionId

  return Cart.find sessionId: sessionId, userId: @userId

###
# tags
###
Meteor.publish "tags", ->
  return Tags.find(shopId: Meteor.app.getShopId())
