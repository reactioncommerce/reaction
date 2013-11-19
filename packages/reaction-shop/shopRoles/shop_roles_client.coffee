###
 Convenience functions for use on client.

 NOTE: You must restrict user actions on the server-side; any
 client-side checks are strictly for convenience and must not be
 trusted.

 @module Helpers
###

###
 Handlebars helpers

 Use a semi-private variable rather than declaring Handlebars
 helpers directly so that we can unit test the helpers.
 XXX For some reason, the Handlebars helpers are not registered
 before the tests run.
###
ShopRoles._handlebarsHelpers =
  ###
   Handlebars helper to check if current user is in at least one
   of the target roles.  For use in client-side templates.

   @method isInRole
   @param {String} role name of role or comma-seperated list of roles
   @return {Boolean} true if current user is in at least one of the target roles
  ###
  isInShopRole: (shopId, role) ->
    user = Meteor.user()
    comma = role && role.indexOf(',')

    return false unless user

    if comma isnt -1
      roles = _.reduce role.split(','), (memo, r) ->
        unless r and r.trim()
          return memo
        memo.push(r.trim())
        return memo
      , []
    else
      roles = [role]

    ShopRoles.userIsInRole(shopId, user, roles)


if 'undefined' isnt typeof Handlebars
  _.each ShopRoles._handlebarsHelpers, (func, name) ->
    Handlebars.registerHelper(name, func)
else
  console.log('WARNING: Roles Handlebars helpers not registered. Handlebars not defined')
