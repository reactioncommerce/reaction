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
    packages = ReactionCore.Collections.Packages.find()
    packages.forEach (pkg) ->
      permissions = []
      for registryItem in pkg.registry
        if registryItem.route
          # filter out potential duplicates
          existing = (existing for existing in permissions when existing.permission is registryItem.route)
          # registry permissions
          definedPermission = (registry for registry in pkg.permissions when registry.permission is registryItem.route)
          definedPermission = definedPermission[0] if definedPermission
          # we'll define all registry routes as permission
          if existing.length is 0
            # create package permissions from registry entries
            permissions.push {
              permission: (definedPermission?.route || registryItem.route)
              label: (definedPermission?.label || registryItem?.label || registryItem?.provides).toUpperCase()
            }
      permissionGroups.push { 'name': pkg.name, 'permissions': _.uniq(permissions) }

    return permissionGroups


Template.shopMember.rendered = ->
  $(@find(".toggle-shop-member-permissions")).collapsible
    'cookieName': "toggle-shop-member-permissions-" + @data.userId
    'speed': 200

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
    console.log "here"
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
    member = template.data

    if $(event.currentTarget).is(':checked')
      Meteor.call "addUserPermissions", member.userId, @.permission, ReactionCore.getShopId()
      return
    else
      Meteor.call "removeUserPermissions", member.userId, @.permission, ReactionCore.getShopId()
      return

  "click .link-shop-member-remove": (event, template) ->
    $icon = $(event.currentTarget)
    if (confirm($icon.data("confirm")))
      Meteor.call "setUserRoles", member.userId, @.permission, Roles.GLOBAL_GROUP
