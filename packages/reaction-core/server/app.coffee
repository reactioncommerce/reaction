###
# Global reaction shop permissions methods
###
_.extend ReactionCore,
  getCurrentShopCursor: (client) ->
    domain = @getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1})
    if !cursor.count()
      console.log "Reaction Configuration: Add a domain entry to shops for: ", domain
    return cursor

  getCurrentShop: (client) ->
    cursor = @getCurrentShopCursor(client)
    return cursor.fetch()[0]

  getShopId: (client) ->
    return @getCurrentShop(client)._id

  getDomain: (client) ->
    #todo: eventually we want to use the host domain to determine
    #which shop from the shops collection to use here, hence the unused client arg
    return Meteor.absoluteUrl().split('/')[2].split(':')[0]

  findMember: (shop, userId) ->
    shop = @getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    return _.find shop.members, (member) ->
      userId is member.userId

  hasPermission: (permissions, shop, userId) ->
    return false unless permissions
    shop = @getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    permissions = [permissions] unless _.isArray(permissions)
    has = @hasOwnerAccess(shop, userId)
    unless has
      member = @findMember(shop, userId)
      if member
        has = member.isAdmin or _.intersection(permissions, member.permissions).length
    return has

  hasOwnerAccess: (shop, userId) ->
    shop = @getCurrentShop() unless shop
    userId = Meteor.userId() unless userId
    return Roles.userIsInRole(userId, "admin") or userId is shop.ownerId
