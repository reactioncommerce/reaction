Cart  = ReactionCore.Collections.Cart
Accounts = ReactionCore.Collections.Accounts
Discounts = ReactionCore.Collections.Discounts
Media = ReactionCore.Collections.Media
Orders = ReactionCore.Collections.Orders
Packages = ReactionCore.Collections.Packages
Products = ReactionCore.Collections.Products
Shipping =  ReactionCore.Collections.Shipping
Shops = ReactionCore.Collections.Shops
Tags = ReactionCore.Collections.Tags
Taxes = ReactionCore.Collections.Taxes
Translations = ReactionCore.Collections.Translations

###
# Reaction Server / amplify permanent sessions
# If no id is passed we create a new session
# Load the session
# If no session is loaded, creates a new one
###
@ServerSessions = new Mongo.Collection("Sessions")
Meteor.publish 'Sessions', (id) ->
  check id, Match.OneOf(String, null)

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
Meteor.publish "media", ->
  return Media.find({ 'metadata.shopId': ReactionCore.getShopId(@) }, {sort: {"metadata.priority": 1}})

###
# i18n - translations
###
Meteor.publish "Translations", (sessionLanguage) ->
  check sessionLanguage, String
  return Translations.find({ $or: [{'i18n':'en'},{'i18n': sessionLanguage}] })

###
# userProfile
# get any user name,social profile image
# should be limited, secure information
###
Meteor.publish "UserProfile", (profileId) ->
  check profileId, Match.OneOf(String, null)

  if profileId?
    if Roles.userIsInRole(this.userId, ['dashboard/orders','owner','admin','dashboard/customers'])
      return Meteor.users.find _id: profileId,
        fields:
          profile: 1
          emails: 1
    else
      ReactionCore.Events.info "user profile access denied"
      return []
  else
    ReactionCore.Events.info "profileId not defined. access denied"
    return []

###
#  Packages contains user specific configuration
#  settings, package access rights
###
Meteor.publish "Packages", ->
  shop = ReactionCore.getCurrentShop(this)
  if shop
    if Roles.userIsInRole(this.userId, ['dashboard','owner','admin'])
      return Packages.find shopId: shop._id
    else
      # settings.public published
      # other access to settings,etc is blocked
      # for non administrative views
      return Packages.find { shopId: shop._id},
        fields:
          name: true
          enabled: true
          registry: true
          shopId: true
          'settings.public': true
      # TODO Filter roles/security here for package routes/template access.
  else
    return []

###
# shops
###
Meteor.publish 'shops', ->
  ReactionCore.getCurrentShopCursor(@)

Meteor.publish 'shopMembers', ->
  self = @
  handle = ReactionCore.getCurrentShopCursor(self).observeChanges
    added: (id) ->
      shop = Shops.findOne id
      memberIds = _.pluck shop.members, "userId"
      Meteor.users.find({_id: {$in: memberIds}}, {fields: {emails: 1, profile: 1 }}).forEach (user) ->
        self.added("users", user._id, user)
    changed: (id) ->
      shop = Shops.findOne id
      memberIds = _.pluck shop.members, "userId"
      Meteor.users.find({_id: {$in: memberIds}}, {fields: {emails: 1, profile: 1 }}).forEach (user) ->
        self.added("users", user._id, user)
  self.ready()
  self.onStop ->
    handle.stop()
  return

###
# products
###
Meteor.publish 'products', (userId, shops) ->
  shop = ReactionCore.getCurrentShop(@)
  if shop
    selector = {shopId: shop._id}
    ## add additional shops
    if shops
      selector = {shopId: {$in: shops}}
    unless Roles.userIsInRole(this.userId, ['admin'])
      selector.isVisible = true
    return Products.find(selector)
  else
    return []

Meteor.publish 'product', (productId) ->
  check productId, String

  shop = ReactionCore.getCurrentShop(@) #todo: wire in shop
  if productId.match /^[A-Za-z0-9]{17}$/
    return Products.find(productId)
  else
    return Products.find({handle: { $regex : productId, $options:"i" } })

###
# orders
###
Meteor.publish 'orders', (userId) ->
  check userId, Match.Optional(String)
  # only admin can get all orders
  if Roles.userIsInRole(this.userId, ['admin','owner'])
    return Orders.find( shopId: ReactionCore.getShopId(@) )
  else
    return []

###
# account orders
###
Meteor.publish 'accountOrders', (sessionId, userId) ->
  check sessionId, Match.OptionalOrNull(String)
  check userId, Match.OptionalOrNull(String)
  shopId = ReactionCore.getShopId(@)
  # cure for null query match and added check
  if userId and userId isnt @.userId then return []
  unless userId then userId = ''
  unless sessionId then sessionId = ''
  # publish user / session orders
  return Orders.find({'shopId': shopId, $or: [{'userId': userId}, 'sessions': $in: [ sessionId ]] })

###
# cart
###
Meteor.publish 'cart', (sessionId, userId) ->
  check sessionId, Match.OptionalOrNull(String)
  check userId, Match.OptionalOrNull(String)
  if !sessionId then return
  shopId = ReactionCore.getShopId(@)

  # getCurrentCart returns cart cursor
  currentCart = getCurrentCart sessionId, shopId, @userId
  ReactionCore.Events.debug "Publishing cart sessionId:" + sessionId
  return currentCart

###
# accounts
###
Meteor.publish 'accounts', (sessionId, userId) ->
  check sessionId, Match.OneOf(String, null)
  check userId, Match.OneOf(String, null)
  shopId = ReactionCore.getShopId(@)
  # admin gets it all
  if Roles.userIsInRole(this.userId, ['admin','owner'])
    return Accounts.find shopId: shopId
  # returns userId (authenticated account)
  else if @userId
    return Accounts.find userId: @userId, shopId: shopId
  # return session account (guest)
  else
    return Accounts.find sessionId: sessionId

###
# tags
###
Meteor.publish "tags", ->
  return Tags.find(shopId: ReactionCore.getShopId())

###
# shipping
###
Meteor.publish "shipping", ->
  return Shipping.find(shopId: ReactionCore.getShopId())

###
# taxes
###
Meteor.publish "taxes", ->
  return Taxes.find(shopId: ReactionCore.getShopId())

###
# discounts
###
Meteor.publish "discounts", ->
  return Discounts.find(shopId: ReactionCore.getShopId())
