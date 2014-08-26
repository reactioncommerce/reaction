Template.shopMember.helpers
  user: ->
    if ReactionCore.hasOwnerAccess()
      shopMembers = Meteor.subscribe 'shopMembers'
      if shopMembers.ready()
        user = Meteor.users.findOne @userId
        user =
          email: user.emails[0].address
          name: user.profile.name
        return user

  isAdmin: ->
    if @.isAdmin is "yes"
      return true
    else
      return false

  userIdIsAdmin: ->
    return @.userId + "_is_admin"

  permissionGroups: ->
    ReactionCore.shopPermissionGroups

  isChecked: (permission, userId) ->
    currentPermissions = Shops.findOne().members
    for member in currentPermissions
      if member.userId is userId and member?.permissions
        for ischecked in member?.permissions
          if ischecked is permission
            return "checked"

  hasOwnerAccessToggle: ->
    if ReactionCore.hasOwnerAccess()
      return "toggle-shop-member-permissions"


Template.shopMember.rendered = ->
  $(@find(".toggle-shop-member-permissions")).collapsible
    cookieName: "toggle-shop-member-permissions-" + @data.userId
    speed: 200

Template.shopMember.events
  "change .shop-member-is-admin": (event, template) ->
    modifier = {$set: {}}
    modifier.$set["members." + @index + ".isAdmin"] = $(event.currentTarget).val() is "yes"
    Shops.update ReactionCore.getShopId(), modifier
    return

  "change .toggle-shop-member-permission": (event, template) ->
    member = template.data
    operator = if $(event.currentTarget).is(':checked') then "$addToSet" else "$pull"
    modifier = {}
    modifier[operator] = {}
    modifier[operator]["members." + member.index + ".permissions"] = @permission
    Shops.update ReactionCore.getShopId(), modifier

  "click .link-shop-member-remove": (event, template) ->
    $icon = $(event.currentTarget)
    if (confirm($icon.data("confirm")))
      Shops.update ReactionCore.getShopId(), {$pull: {members: {userId: @userId}}}
