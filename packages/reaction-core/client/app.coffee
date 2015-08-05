###
# Global reaction shop permissions methods and shop initialization
###
_.extend ReactionCore,
  shopId: null
  init: ->
    self = @
    # We want this to auto-update whenever shops or packages change, login/logout, etc.
    Tracker.autorun ->
      shopHandle = Meteor.subscribe "Shops"
      if shopHandle.ready()
        domain = Meteor.absoluteUrl().split('/')[2].split(':')[0]
        shop = ReactionCore.Collections.Shops.findOne domains: domain
        self.shopId = shop._id
        return self

  # permission check
  hasPermission: (permissions, userId) ->
    # assume admin, owner access
    unless _.isArray permissions
      permissions = [permissions]
      permissions.push "admin", "owner"

    if Roles.userIsInRole userId, permissions, @shopId
      return true
    else if Roles.userIsInRole userId, permissions, Roles.GLOBAL_GROUP
      return true
    for shop in @getSellerShopId()
      if Roles.userIsInRole userId, permissions, shop
        return true
    return false

  hasOwnerAccess: ->
    ownerPermissions = ['owner']
    return @hasPermission ownerPermissions

  # admin access
  hasAdminAccess: ->
    adminPermissions = ['owner','admin']
    return @hasPermission adminPermissions

  # dashboard access
  hasDashboardAccess: ->
    dashboardPermissions = ['owner','admin','dashboard']
    return @hasPermission dashboardPermissions

  # returns shop id
  getShopId: ->
    Session.set "currentShopId", @shopId
    return @shopId

  # TODO:  setShopId: (shopId) ->
  #   @.shopId = shopId

  allowGuestCheckout: ->
    # todo: refactor, this is overkill
    packageRegistry = ReactionCore.Collections.Packages.findOne name: 'core', shopId: @shopId
    allowGuest = packageRegistry?.settings?.public?.allowGuestCheckout || true
    return allowGuest

  # return the logged in user's shop[s] if he owns any or if he is an admin -> used in multivendor
  getSellerShopId: (client) ->
    return Roles.getGroupsForUser Meteor.userId(), 'admin'

###
# configure bunyan logging module for reaction client
# See: https://github.com/trentm/node-bunyan#levels
###
isDebug = Meteor?.settings?.public?.isDebug
# acceptable levels
levels = ["FATAL","ERROR","WARN", "INFO", "DEBUG", "TRACE"]
# set logging levels from settings
if typeof isDebug isnt 'boolean' and typeof isDebug isnt 'undefined' then isDebug = isDebug.toUpperCase()
# check level validity
unless _.contains levels, isDebug
  isDebug = "INFO"
# Define bunyan levels and output to Meteor console
ReactionCore.Events = bunyan.createLogger name: 'core-client'
# sets bunyan logging level
ReactionCore.Events.level(isDebug)


###
# registerLoginHandler
# method to create anonymous users
###
Accounts.loginWithAnonymous = (anonymous, callback) ->
  Accounts.callLoginMethod
    methodArguments: [ { anonymous: true } ]
    userCallback: callback
  return


###
#  Init Reaction client
###
Meteor.startup ->
  # quick little client safety check
  if (PackageRegistry?)
    ReactionCore.Events.warn "Bravely warning you that PackageRegistry should not be exported to client.", PackageRegistry

  # Ignition.....
  ReactionCore.init()

  # Enable anonymous users
  Deps.autorun ->
    if ReactionCore.allowGuestCheckout() and !Meteor.userId()
      Accounts.loginWithAnonymous()
    return
