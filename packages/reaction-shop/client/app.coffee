Meteor.app = _.extend(Meteor.app || {},
  shopId: null
  isOwner: null
  isAdmin: null
  userPermissions: []
  shopPermissions: []
  shopPermissionGroups: []
  init: (shop) ->
    @shopId = shop._id

    permissions = []
    usedPackages = _.map Packages.find({shopId: @shopId}).fetch(), (packageConfig) ->
      _.find(Meteor.app.packages, (appPackage) -> packageConfig.name is appPackage.name)
    _.each usedPackages, (usedPackage) ->
      _.each usedPackage?.shopPermissions, (shopPermission) ->
        permissions.push shopPermission
    @shopPermissions = _.pluck(permissions, "permission")
    @shopPermissionGroups = for groupName, groupPermissions of _.groupBy(permissions, "group")
      group: groupName
      permissions: groupPermissions

    @isOwner = Meteor.userId() is shop.ownerId

    member = _.find shop.members, (member) ->
      member.userId is Meteor.userId()
    if member
      @isAdmin = member.isAdmin
      @userPermissions = member.permissions
  hasPermission: (permissions) ->
    return false unless permissions
    permissions = [permissions] unless _.isArray(permissions)
    @.hasOwnerAccess() or @isAdmin or _.intersection(permissions, @userPermissions).length
  hasOwnerAccess: ->
    Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
)
