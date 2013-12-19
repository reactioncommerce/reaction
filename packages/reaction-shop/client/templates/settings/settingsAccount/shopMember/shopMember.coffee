Template.shopMember.helpers
  userEmail: ->
    @user.emails[0].address

  permissionGroups: ->
    Meteor.app.shopPermissionGroups

  isChecked: (permissions) ->
    @permission in (permissions || [])

Template.shopMember.rendered = ->
  $(@find(".toggle-shop-member-permissions")).collapsible
    cookieName: "toggle-shop-member-permissions-" + @data.userId
    speed: 200

Template.shopMember.events
  "change .shop-member-is-admin": (event) ->
    modifier = {$set: {}}
    modifier.$set["members." + @index + ".isAdmin"] = $(event.currentTarget).val() is "yes"
    Shops.update Meteor.app.shopId, modifier

  "change .toggle-shop-member-permission": (event, template) ->
    member = template.data
    operator = if $(event.currentTarget).is(':checked') then "$addToSet" else "$pull"
    modifier = {}
    modifier[operator] = {}
    modifier[operator]["members." + member.index + ".permissions"] = @permission
    Shops.update Meteor.app.shopId, modifier

  "click .link-shop-member-remove": (event) ->
    event.stopPropagation()
    $icon = $(event.currentTarget)
    if (confirm($icon.data("confirm")))
      Shops.update Meteor.app.shopId, {$pull: {members: {userId: @userId}}}
