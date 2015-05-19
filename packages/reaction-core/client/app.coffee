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
  hasPermission: (permissions) ->
    # assume admin, owner access
    unless _.isArray permissions
      permissions = [permissions]
      permissions.push "admin", "owner"

    if Roles.userIsInRole Meteor.userId(), permissions, @shopId
      return true
    if Roles.userIsInRole Meteor.userId(), permissions, Roles.GLOBAL_GROUP
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

  # TODO: getSellerShopId NEEDS REFACTOR

  # # return the logged in user's shop if he owns any or if he is an admin -> used in multivendor
  # getSellerShopId: (client) ->
  #   if Roles.userIsInRole(Meteor.userId(), ['owner'])
  #     return ReactionCore.Collections.Shops.findOne({ownerId: Meteor.userId()})?._id;
  #   else if Roles.userIsInRole(Meteor.userId(), ['admin'])
  #     return ReactionCore.Collections.Shops.findOne({'members.isAdmin': true, 'members.userId': Meteor.userId()})?._id;
  #   return null;

Meteor.startup ->
  # TODO: this could grow.. and grow...
  # quick little client safety check
  if (PackageRegistry?)
    console.error "Bravely warning you that PackageRegistry should not be exported to client."

  # Ignition.....
  ReactionCore.init()
