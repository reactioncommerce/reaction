###
 Provides functions related to user authorization. Compatible with built-in Meteor accounts packages.

 @module ShopRoles
###

###
 Roles collection documents consist only of an id and a role name.
   ex: { _id:<uuid>, name: "admin" }
###
unless Meteor.shopRoles
  Meteor.shopRoles = new Meteor.Collection('shopRoles')


###
 <p>Role-based authorization compatible with built-in Meteor accounts package.</p>
 <br />
 <p>Uses 'roles' collection to store existing roles with unique index on 'name' field.</p>
 <p>Adds a 'roles' field to user objects in 'users' collection when they are added to a given role.</p>

 @class Roles
 @constructor
###
if 'undefined' is typeof ShopRoles
  ShopRoles = {}

###
 Create a new role. Whitespace will be trimmed.

 @method createRole
 @param {String} role Name of role
 @return {String} id of new role
###
ShopRoles.createRole = (role) ->
  if not role or 'string' isnt typeof role or role.trim().length is 0
    return

  try
    id = Meteor.roles.insert({'name':role.trim()})
    return id
  catch e
    # (from Meteor accounts-base package, insertUserDoc func)
    # XXX string parsing sucks, maybe
    # https://jira.mongodb.org/browse/SERVER-3069 will get fixed one day
    throw e if e.name isnt 'MongoError'
    match = e.err.match(/^E11000 duplicate key error index: ([^ ]+)/)
    throw e unless !match
    if match[1].indexOf('$name') isnt -1
      throw new Meteor.Error(403, "Role already exists.")
    throw e

###
 Delete an existing role.  Will throw "Role in use" error if any users
 are currently assigned to the target role.

 @method deleteRole
 @param {String} role Name of role
###
ShopRoles.deleteRole = (role) ->
  unless role
    return

  foundExistingUser = Meteor.users.findOne({'shopRoles.$.name': {$in: [role]}}, {_id: 1})

  if foundExistingUser
    throw new Meteor.Error(403, 'Role in use')

  thisRole = Meteor.shopRoles.findOne({ name: role })
  if thisRole
    Meteor.shopRoles.remove(thisRole._id)

###
 Add users to roles. Will create roles as needed.

 Makes 2 calls to database:
  1. retrieve list of all existing roles
  2. update users' roles

 @method addUsersToRoles
 @param {Array|String} users id(s) of users to add to roles
 @param {Array|String} roles name(s) of roles to add users to
###
ShopRoles.addUsersToRoles = (shopId, users, roles) ->
  throw new Error ("Missing 'shopId' param") unless shopId # TODO: check Shops.findOne(shopId)
  throw new Error ("Missing 'users' param") unless users
  throw new Error ("Missing 'roles' param") unless roles

  # ensure arrays
  users = [users] unless _.isArray(users)
  roles = [roles] unless _.isArray(roles)

  # remove invalid roles
  roles = _.reduce roles, (memo, role) ->
    if role and 'string' is typeof role and role.trim().length > 0
      memo.push(role.trim())
    return memo
  , []

  if roles.length is 0
    return

  # ensure all roles exist in 'roles' collection
  existingRoles = _.reduce Meteor.shopRoles.find({}).fetch(), (memo, role) ->
    memo[role.name] = true
    return memo
  , {}
  _.each roles, (role) ->
    unless existingRoles[role]
      ShopRoles.createRole(role)

  shopRoles = _.map roles, (name) ->
    {name: name, shopId: shopId}
  # update all users, adding to roles set
  if Meteor.isClient
    _.each users, (user) ->
      # Iterate over each user to fulfill Meteor's 'one update per ID' policy
      Meteor.users.update user, {$addToSet: {shopRoles: {$each: shopRoles}}}, {multi: true}
  else
    # On the server we can leverage MongoDB's $in operator for performance
    Meteor.users.update {_id: {$in: users}}, {$addToSet: {shopRoles: {$each: shopRoles}}}, {multi: true}

###
 Remove users from roles

 @method removeUsersFromRoles
 @param {Array|String} users id(s) of users to add to roles
 @param {Array|String} roles name(s) of roles to add users to
###
ShopRoles.removeUsersFromRoles = (shopId, users, roles) ->
  throw new Error ("Missing 'shopId' param") unless shopId # TODO: check Shops.findOne(shopId)
  throw new Error ("Missing 'users' param") unless users
  throw new Error ("Missing 'roles' param") unless roles

  # ensure arrays
  users = [users] unless _.isArray(users)
  roles = [roles] unless _.isArray(roles)

  shopRoles = _.map roles, (name) ->
    {name: name, shopId: shopId}
  # update all users, remove from roles set
  if Meteor.isClient
    # Iterate over each user to fulfill Meteor's 'one update per ID' policy
    _.each users, (user) ->
      Meteor.users.update user, {$pullAll: {shopRoles: shopRoles}}, {multi: true}
  else
    # On the server we can leverage MongoDB's $in operator for performance
    Meteor.users.update {_id: {$in: users}}, {$pullAll: {shopRoles: shopRoles}}, {multi: true}

###
 Check if user is in role

 @method userIsInRole
 @param {String|Object} user Id of user or actual user object
 @param {String|Array} roles Name of role or Array of roles to check against.  If array, will return true if user is in _any_ role.
 @return {Boolean} true if user is in _any_ of the target roles
###
ShopRoles.userIsInRole = (shopId, user, roles) ->
  # ensure array to simplify code
  roles = [roles] unless _.isArray(roles)
  shopRoles = _.map roles, (name) ->
    {name: name, shopId: shopId}

  unless shopId and user and 'string' is typeof shopId
    return false
  else if 'object' is typeof user
    userShopRoles = user.shopRoles
    if _.isArray(userShopRoles)
      return _.some shopRoles, (shopRole) ->
        return _.contains(userShopRoles, shopRole)
    # missing shopRoles field, try going direct via id
    id = user._id
  else if 'string' is typeof user
    id = user

  return false unless id

  return Meteor.users.findOne {_id: id, shopRoles: {$in: shopRoles}}, {_id: 1}

###
 Retrieve users roles

 @method getRolesForUser
 @param {String} user Id of user
 @return {Array} Array of user's roles, unsorted
###
ShopRoles.getRolesForUser = (user) ->
  user = Meteor.users.findOne user, {_id: 0, shopRoles: 1}

  if user then user.shopRoles else undefined

###
 Retrieve all existing roles

 @method getAllRoles
 @return {Cursor} cursor of existing roles
###
ShopRoles.getAllRoles = ->
  Meteor.shopRoles.find({}, {sort: {name: 1}})

###
 Retrieve all users who are in target role

 @method getUsersInRole
 @param {String} role Name of role
 @return {Cursor} cursor of users in role
###
ShopRoles.getUsersInRole = (shopId, role) ->
  Meteor.users.find {shopRoles: {$in: [{name: role, shopId: shopId}] } }
