Template.shopMember.helpers
  hasAdminRole: ->
    if Roles.userIsInRole @.userId, 'admin', ReactionCore.getShopId() then return "checked"

  hasLimitedRole: ->
    if Roles.userIsInRole @.userId, 'manager', ReactionCore.getShopId() then return "checked"

  isChecked: (permission, userId) ->
    if Roles.userIsInRole userId, permission, ReactionCore.getShopId() then return "checked"

  userRoleIsAdmin: ->
    return @.userId + "_is_admin"

  userRoleIsCustom: ->
    return @.userId + "_is_custom"

  hasOwnerAccessToggle: ->
    if Roles.userIsInRole Meteor.userId(), ['owner','admin','manager'], ReactionCore.getShopId()
      return "toggle-shop-member-permissions"

  permissionGroups: ->
    permissionGroups = []
    ReactionCore.Collections.Packages.find().forEach (pkg) ->
      permissions = []
      permissionMap = {}

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
            permission: registryItem.route
            label: registryItem.label || registryItem.provides || registryItem.route
      # push this packages permissions as a group
      permissionGroups.push { 'name': pkg.name, 'permissions': _.uniq(permissions) }
    return permissionGroups

# Template.shopMember.rendered = ->
#   $(@find(".toggle-shop-member-permissions")).collapsible
#     'cookieName': "toggle-shop-member-permissions-" + @data.userId
#     'speed': 200

Template.shopMember.events
  # toggle admin permissions
  "change .shop-member-is-admin": (event, template) ->
    # current = Roles.userIsInRole @.userId, 'admin', ReactionCore.getShopId()
    # console.log current
    if $(event.currentTarget).is(':checked')
      console.log "adding admin permissions"
      Meteor.call "addUserPermissions", @.userId, 'admin', ReactionCore.getShopId()
      return
    else
      console.log "removing admin"
      Meteor.call "removeUserPermissions", @.userId, 'admin', ReactionCore.getShopId()
      return

  # toggle customer permissions
  "change .shop-member-is-custom": (event, template) ->
    current = Roles.userIsInRole @.userId, 'admin', ReactionCore.getShopId()
    # if current and !$(event.currentTarget).is(':checked')
    #   Meteor.call "removeUserPermissions", @.userId, 'admin', ReactionCore.getShopId()

    if $(event.currentTarget).is(':checked')
      console.log "adding custom permissions"
      Meteor.call "addUserPermissions", @.userId, 'manager', ReactionCore.getShopId()
      return
    else if current and !$(event.currentTarget).is(':checked')
      console.log "removing custom"
      Meteor.call "removeUserPermissions", @.userId, ['admin','manager'], ReactionCore.getShopId()
      return

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
      Meteor.call "addUserPermissions", member.userId, permissions, ReactionCore.getShopId()
      return
    else
      Meteor.call "removeUserPermissions", member.userId, permissions, ReactionCore.getShopId()
      return

  "click .link-shop-member-remove": (event, template) ->
    $icon = $(event.currentTarget)
    if (confirm($icon.data("confirm")))
      Meteor.call "setUserRoles", @.userId, 'guest', Roles.GLOBAL_GROUP
