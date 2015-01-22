###
# configure bunyan logging module for reaction server
# See: https://github.com/trentm/node-bunyan#levels
###
isDebug = Meteor.settings.isDebug

# acceptable levels
levels = ["FATAL","ERROR","WARN", "INFO", "DEBUG", "TRACE"]

#
# if debug is true, or NODE_ENV development environment and not false
# set to lowest level, or any defined level set to level
#
if isDebug is true or ( process.env.NODE_ENV is "development" and isDebug isnt false )
  # set logging levels from settings
  if typeof isDebug isnt 'boolean' and typeof isDebug isnt 'undefined' then isDebug = isDebug.toUpperCase()
  unless _.contains levels, isDebug
    isDebug = "WARN"

# Define bunyan levels and output to Meteor console
ReactionCore.Events = logger.bunyan.createLogger(
  name: "reactioncommerce:core"
  serializers: logger.bunyan.stdSerializers
  streams: [
    {
      level: "debug"
      stream: (unless isDebug is "DEBUG" then logger.bunyanPretty() else process.stdout )
    }
    {
      level: "error"
      path: "reaction.log" # log ERROR and above to a file
    }
  ]
)
# set bunyan logging level
ReactionCore.Events.level(isDebug)

###
# Global reaction shop permissions methods
###
_.extend ReactionCore,
  getCurrentShopCursor: (client) ->
    domain = @getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1})
    if !cursor.count()
      ReactionCore.Events.info "Reaction Configuration: Add a domain entry to shops for: ", domain
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
