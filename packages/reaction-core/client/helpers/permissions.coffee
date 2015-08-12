###
# Methods for the reaction permissions
# https://github.com/ongoworks/reaction#rolespermissions-system
# use: {{hasPermissions admin userId}}
###
Template.registerHelper "hasPermission", (permissions, userId) ->
  check permissions, Match.OneOf(String, Object)
  if typeof(userId) is 'object' then userId = Meteor.userId()
  return ReactionCore.hasPermission permissions, userId

Template.registerHelper "hasOwnerAccess", ->
  ReactionCore.hasOwnerAccess()

Template.registerHelper "hasAdminAccess", ->
  ReactionCore.hasAdminAccess()

Template.registerHelper "hasDashboardAccess", ->
  return ReactionCore.hasDashboardAccess()

Template.registerHelper "allowGuestCheckout", ->
  return ReactionCore.allowGuestCheckout()
