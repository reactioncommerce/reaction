_.extend ReactionCore,
  shopId: null
  isMember: false
  isOwner: null
  isAdmin: null
  userPermissions: []
  shopPermissions: []
  shopPermissionGroups: []
  init: ->
    self = @
    # We want this to auto-update whenever shops or packages change, login/logout, etc.
    Deps.autorun ->
      domain = Meteor.absoluteUrl().split('/')[2].split(':')[0]
      shop = Shops.findOne domains: domain
      
      if shop
        self.shopId = shop._id

        permissions = []
        usedPackages = ReactionCore.Collections.Packages.find({shopId: self.shopId, enabled: true}).map (p) ->
          return p.info()

        for usedPackage in usedPackages
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

  hasDashboardAccess: ->
    return @isMember or @.hasOwnerAccess()
  hasPermission: (permissions) ->
    return false unless permissions
    permissions = [permissions] unless _.isArray(permissions)
    return @.hasOwnerAccess() or _.intersection(permissions, @userPermissions).length or (@isAdmin and _.intersection(permissions, @shopPermissions).length)
  hasOwnerAccess: ->
    return Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
  getShopId: ->
    return @shopId

Meteor.startup ->
  ReactionCore.init()