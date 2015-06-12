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
        return

  # permission check
  hasPermission: (permissions, userId) ->
    userId = userId || Meteor.userId()
    # assume admin, owner access
    unless _.isArray permissions
      permissions = [permissions]
      permissions.push "admin", "owner"

    if Roles.userIsInRole userId, permissions, @shopId
      return true
    if Roles.userIsInRole userId, permissions, Roles.GLOBAL_GROUP
      return true

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
    return @shopId

  # TODO:  setShopId: (shopId) ->
  #   @.shopId = shopId

  # return the logged in user's shop[s] if he owns any or if he is an admin -> used in multivendor
  getSellerShopId: (client) ->
    return Roles.getGroupsForUser Meteor.userId(), ['owner','admin']

Meteor.startup ->
  ###
  # configure bunyan logging module for reaction client
  # See: https://github.com/trentm/node-bunyan#levels
  ###
  isDebug = Meteor?.settings?.public?.isDebug || "INFO"
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

  # quick little client safety check
  if (PackageRegistry?)
    ReactionCore.Events.warn "Bravely warning you that PackageRegistry should not be exported to client.", PackageRegistry

  # Ignition.....
  ReactionCore.init()
