###
# Global reaction shop permissions methods and shop initialization
###
_.extend ReactionCore,
  shopId: null
  isOwner: null
  isAdmin: null
  init: ->
    self = @
    # We want this to auto-update whenever shops or packages change, login/logout, etc.
    Tracker.autorun ->
      domain = Meteor.absoluteUrl().split('/')[2].split(':')[0]
      shop = ReactionCore.Collections.Shops.findOne domains: domain

      if shop # domain match shop
        self.shopId = shop._id
        self.isOwner = Roles.userIsInRole Meteor.userId(), 'owner', shop._id
        self.isAdmin = Roles.userIsInRole Meteor.userId(), 'admin', shop._id
      else # marketplace
        shop = ReactionCore.Collections.Shops.findOne isMarketplace: true
        self.shopId = shop._id if shop
        #
        # TODO: implement shopId as  array or string
        #
      return

  # role checkout
  hasOwnerAccess: ->
    return Roles.userIsInRole Meteor.userId(), 'owner', @shopId

  # dashboard access
  hasDashboardAccess: ->
    return Roles.userIsInRole Meteor.userId(), 'admin', @shopId

  # permission check
  hasPermission: (permissions) ->
    return Roles.userIsInRole Meteor.userId(), permissions, @shopId

  # returns shop id
  getShopId: ->
    return @shopId

  # TODO: NEEDS REFACTOR

  # # return the logged in user's shop if he owns any or if he is an admin -> used in multivendor
  # getSellerShopId: (client) ->
  #   if Roles.userIsInRole(Meteor.userId(), ['owner'])
  #     return ReactionCore.Collections.Shops.findOne({ownerId: Meteor.userId()})?._id;
  #   else if Roles.userIsInRole(Meteor.userId(), ['admin'])
  #     return ReactionCore.Collections.Shops.findOne({'members.isAdmin': true, 'members.userId': Meteor.userId()})?._id;
  #   return null;

Meteor.startup ->
  # todo: this could grow.. and grow...
  # quick little client safety check
  if (PackageRegistry?) then console.error "Bravely warning you that PackageRegistry should not be exported to client."

  # Ignition.....
  ReactionCore.init()
