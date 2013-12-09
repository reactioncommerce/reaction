packageShop =
  shopId: null
  isOwner: null
  isAdmin: null
  permissions: []
  init: (shop) ->
    @shopId = shop._id
    @isOwner = Meteor.userId() is shop.ownerId
    @isAdmin = Meteor.userId() in shop.admins

    userPermissions = _.filter shop.usersPermissions, (userPermission) ->
      userPermission.userId is Meteor.userId()
    @permissions = _.pluck userPermissions, "permission"
  havePermission: (permissions) ->
    permissions = [permissions] unless _.isArray(permissions)
    Roles.userIsInRole(Meteor.user(), "admin") or @isOwner or @isAdmin or _.intersection(permissions, @permissions).length
