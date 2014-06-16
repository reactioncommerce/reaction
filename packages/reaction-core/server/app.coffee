###
# Global reaction shop permissions methods
###
Meteor.app = _.extend(Meteor.app || {},
  getCurrentShopCursor: (client) ->
    domain = Meteor.app.getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1})
    if !cursor.count()
      console.log "Reaction Configuration: Add a domain entry to shops for: ", domain
    return cursor

  getCurrentShop: (client) ->
    cursor = Meteor.app.getCurrentShopCursor(client)
    cursor.fetch()[0]

  getShopId: (client) ->
    Meteor.app.getCurrentShopCursor(client)._id

  getDomain: (client) ->
    Meteor.absoluteUrl().split('/')[2].split(':')[0]

  findMember: (shop, userId) ->
    shop = @.getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    _.find shop.members, (member) ->
      userId is member.userId

  hasPermission: (permissions, shop, userId) ->
    return false unless permissions
    shop = @.getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    permissions = [permissions] unless _.isArray(permissions)
    has = @.hasOwnerAccess(shop, userId)
    unless has
      member = @.findMember(shop, userId)
      if member
        has = member.isAdmin or _.intersection(permissions, member.permissions).length
    has

  hasOwnerAccess: (shop, userId) ->
    shop = @.getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    Roles.userIsInRole(userId, "admin") or userId is shop.ownerId
)
