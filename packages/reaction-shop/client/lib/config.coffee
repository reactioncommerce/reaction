packageShop =
  shopId: null
  isOwner: null
  isAdmin: null
  permissions: []
  shopPermissionGroups: []
  init: (shop) ->
    @shopId = shop._id

    permissions = []
    usedPackages = _.map PackageConfigs.find({shopId: @shopId}).fetch(), (packageConfig) ->
      _.find(Meteor.app.packages, (appPackage) -> packageConfig.name is appPackage.name)
    _.each usedPackages, (usedPackage) ->
      _.each usedPackage?.shopPermissions, (shopPermission) ->
        permissions.push shopPermission
    @shopPermissionGroups = for groupName, groupPermissions of _.groupBy(permissions, "group")
      group: groupName
      permissions: groupPermissions

    @isOwner = Meteor.userId() is shop.ownerId

    member = _.find shop.members, (member) ->
      member.userId is Meteor.userId()
    if member
      @isAdmin = member.isAdmin
      @permissions = member.permissions
  hasPermission: (permissions) ->
    permissions = [permissions] unless _.isArray(permissions)
    Roles.userIsInRole(Meteor.user(), "admin") or @isOwner or @isAdmin or _.intersection(permissions, @permissions).length
  hasOwnerAccess: ->
    Roles.userIsInRole(Meteor.user(), "admin") or @isOwner
