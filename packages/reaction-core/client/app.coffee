###
# Global reaction shop permissions methods and shop initialization
###
_.extend ReactionCore,
  shopId: null
  isMember: false
  isOwner: null
  isAdmin: null
  canCheckoutAsGuest: false
  userPermissions: []
  shopPermissions: []
  shopPermissionGroups: []
  init: ->
    self = @
    # We want this to auto-update whenever shops or packages change, login/logout, etc.
    Tracker.autorun ->
      domain = Meteor.absoluteUrl().split('/')[2].split(':')[0]
      shop = Shops.findOne domains: domain

      if shop
        self.shopId = shop._id
        # check to see if guest checkout is enabled
        self.canCheckoutAsGuest = shop.canCheckoutAsGuest || false
        #permissions and packages
        permissions = []
        # package registry update
        # use this when you want current packages, not the initial configuration
        # exposes package details
        #
        self.usedPackages = ReactionCore.Collections.Packages.find({shopId: self.shopId, enabled: true}).map (p) ->
          return p.info()

        for usedPackage in self.usedPackages
          if usedPackage?.shopPermissions
            for shopPermission in usedPackage.shopPermissions
              permissions.push shopPermission

        self.shopPermissions = _.pluck(permissions, "permission")
        self.shopPermissionGroups = for groupName, groupPermissions of _.groupBy(permissions, "group")
          group: groupName
          permissions: groupPermissions

        #XXX probably should use deps to recheck this whenever login/logout?
        self.isOwner = Meteor.userId() is shop.ownerId

        member = _.find shop.members, (member) ->
          member.userId is Meteor.userId()
        if member
          self.isMember = true
          self.isAdmin = member.isAdmin
          self.userPermissions = member.permissions
        else
          self.isMember = false
          self.isAdmin = false
          self.userPermissions = []
      # no shop found
      else
        self.shopId = null
        self.isMember = false
        self.isOwner = null
        self.isAdmin = null
        self.userPermissions = []
        self.shopPermissions = []
        self.shopPermissionGroups = []
  # dashboard access
  hasDashboardAccess: ->
    return @isMember or @.hasOwnerAccess()
  # permission check
  hasPermission: (permissions) ->
    return false unless permissions
    permissions = [permissions] unless _.isArray(permissions)
    return @.hasOwnerAccess() or _.intersection(permissions, @userPermissions).length or (@isAdmin and _.intersection(permissions, @shopPermissions).length)
  # role checkout
  hasOwnerAccess: ->
    return Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
  # returns shop id
  getShopId: ->
    return @shopId
  shopIdAutoValue: ->
    return if @isSet and @isFromTrustedCode

    if Meteor.isClient and @isInsert
      # will be set correctly on the server
      return ReactionCore.getShopId() or "1"
    else if Meteor.isServer and @isInsert
      # forced value for client-initiated inserts
      # or for server-initiated inserts where shopId isn't set
      return ReactionCore.getShopId()
    else
      # for client-initiated update, be
      # sure we don't allow changing this property
      @unset()
      return

Meteor.startup ->
  ReactionCore.init()
