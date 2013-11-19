###
 Roles collection documents consist only of an id and a role name.
   ex: { _id:<uuid>, name: "admin" }
###
unless Meteor.shopRoles
  Meteor.shopRoles = new Meteor.Collection('shopRoles')

  # Create default indexes for roles collection
  Meteor.shopRoles._ensureIndex('shopId', {unique: 1})


###
 Always publish logged-in user's roles so client-side
 checks can work.
###
Meteor.publish null, ->
  Meteor.users.find(this.userId, {fields: {shopRoles: 1}})
