Meteor.app = _.extend(Meteor.app || {},
  packages:
    register: (packageInfo) ->
      @[packageInfo.name] = packageInfo
)

Meteor.app = _.extend(Meteor.app || {},
  shopId: null
  isMember: false
  isOwner: null
  isAdmin: null
  userPermissions: []
  shopPermissions: []
  shopPermissionGroups: []
  init: () ->
    domain = Meteor.absoluteUrl().split('/')[2].split(':')[0]
    shop = Shops.find({domains: domain}, {limit: 1}).fetch()
    if shop[0]?._id then shop = shop[0]
    @shopId = shop._id

    permissions = []
    usedPackages = _.map Packages.find({shopId: @shopId}).fetch(), (packageConfig) ->
      _.find(Meteor.app.packages, (appPackage) -> packageConfig.name is appPackage.name)
    for usedPackage in usedPackages
      if usedPackage?.shopPermissions
        for shopPermission in usedPackage.shopPermissions
          permissions.push shopPermission

    @shopPermissions = _.pluck(permissions, "permission")
    @shopPermissionGroups = for groupName, groupPermissions of _.groupBy(permissions, "group")
      group: groupName
      permissions: groupPermissions

    @isOwner = Meteor.userId() is shop.ownerId

    member = _.find shop.members, (member) ->
      member.userId is Meteor.userId()
    if member
      @isMember = true
      @isAdmin = member.isAdmin
      @userPermissions = member.permissions
  hasDashboardAccess: ->
    @isMember or @.hasOwnerAccess()
  hasPermission: (permissions) ->
    return false unless permissions
    permissions = [permissions] unless _.isArray(permissions)
    @.hasOwnerAccess() or _.intersection(permissions, @userPermissions).length or (@isAdmin and _.intersection(permissions, @shopPermissions).length)
  hasOwnerAccess: ->
    Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
)
