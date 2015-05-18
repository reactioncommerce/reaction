###
# shopMember
# permissions / roles controls
# we use userInRole instead of ReactionCore intentionally
# to check each users permissions
###

Template.shopMember.helpers
  isOwnerDisabled: (userId) ->
    if Meteor.userId() is @.userId
      if Roles.userIsInRole @.userId, 'owner', @.shopId
        return true

  hasPermissionChecked: (permission, userId) ->
    if userId and (
      Roles.userIsInRole userId, permission, @.shopId or
      Roles.userIsInRole userId, permission, Roles.GLOBAL_GROUP
      )
      return "checked"

  groupsForUser: (userId) ->
    userId = userId  || @.userId || Template.parentData(1).userId
    return Roles.getGroupsForUser(userId)

  shopLabel: (shopId) ->
    return ReactionCore.Collections.Shops.findOne( {'_id': Template.currentData() })?.name

  permissionGroups: (shopId) ->
    permissionGroups = []
    ReactionCore.Collections.Packages.find( { 'shopId': Template.currentData() } ).forEach (pkg) ->
      permissions = []
      permissionMap = {}
      if pkg.enabled
        # for each registry item, we'll define permissionGroups
        for registryItem in pkg.registry when registryItem.route
          # registry permissions
          if registryItem.permissions
            for permission in registryItem
              permissions.push permission

          # check for potential duplicates
          for existing in permissions
            permissionMap[existing.permission] = existing.label

          # we'll define all registry routes as permission
          unless permissionMap[registryItem.route]
            # create package permissions from registry entries
            permissions.push
              shopId: pkg.shopId
              permission: registryItem.route
              label: registryItem.label || registryItem.provides || registryItem.route
        # push this packages permissions as a group
        label = pkg.name.replace('reaction','').replace(/(-.)/g, (x) ->
          " " + x[1].toUpperCase()
        )
        permissionGroups.push { 'shopId': pkg.shopId, 'name': pkg.name, label:  label, 'permissions': _.uniq(permissions) }

    return permissionGroups


Template.shopMember.events
  # toggle individual permissions
  "change .toggle-shop-member-permission": (event, template) ->
    self = @
    permissions = []
    member = template.data
    # package will assign all children permissions
    # plus itself (name)
    if self.name
      permissions.push self.name
      for pkgPermissions in self.permissions
        permissions.push pkgPermissions.permission

    # individual permissions
    else
      permissions.push self.permission

    if $(event.currentTarget).is(':checked')
      Meteor.call "addUserPermissions", member.userId, permissions, @.shopId
      return
    else
      Meteor.call "removeUserPermissions", member.userId, permissions, @.shopId
      return

  "click .link-shop-member-remove": (event, template) ->
    $icon = $(event.currentTarget)
    if (confirm($icon.data("confirm")))
      Meteor.call "setUserRoles", @.userId, 'guest', Roles.GLOBAL_GROUP
