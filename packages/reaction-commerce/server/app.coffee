Meteor.app = _.extend(Meteor.app || {},
  getCurrentShopCursor: (client) ->
    domain = Meteor.app.getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1});
    if !cursor.count()
      # if no fixture data was used create empty shop
      shop =
        _id: Random.id()
        name: "localhost"
        createdAt: new Date()
        domains: ["localhost"]
        ownerId: this.userId
        #TODO:  We should route user to a screen to assign/create show owner
      Shops._collection.insert shop
      cursor = Shops.find({}, {sort: {$natural: 1}, limit: 1});
    cursor

  getCurrentShop: (client) ->
    cursor = Meteor.app.getCurrentShopCursor(client)
    cursor.fetch()[0]

  getDomain: (client) ->
    # Pass client in publish functions as "this"
    if !client
      for own sessionId, session of Meteor.default_server.sessions
        if session.userId == Meteor.userId()
          client = {
            _session: session
          }
    if !client then throw "Could not find current session"
    share.get_http_header(client, 'host').split(':')[0]

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
