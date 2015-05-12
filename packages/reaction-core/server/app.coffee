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
  name: "core"
  serializers: logger.bunyan.stdSerializers
  streams: [
    {
      level: "debug"
      stream: (unless isDebug is "DEBUG" then logger.bunyanPretty() else process.stdout )
    }
  ]
)
# set bunyan logging level
ReactionCore.Events.level(isDebug)

###
# ReactionCore methods (server)
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
    return @getCurrentShop(client)?._id

  getDomain: (client) ->
    #TODO: eventually we want to use the host domain to determine
    #which shop from the shops collection to use here, hence the unused client arg
    return Meteor.absoluteUrl().split('/')[2].split(':')[0]

  hasOwnerAccess: (client) ->
    return Roles.userIsInRole Meteor.userId(), 'owner',  @getCurrentShop(client)?._id

  # admin access
  hasAdminAccess: (client) ->
    return Roles.userIsInRole Meteor.userId(), 'admin',  @getCurrentShop(client)?._id

  # dashboard access
  hasDashboardAccess: (client) ->
    return Roles.userIsInRole Meteor.userId(), 'dashboard',  @getCurrentShop(client)?._id

  # permission check
  hasPermission: (client, permissions) ->
    return Roles.userIsInRole Meteor.userId(), permissions,  @getCurrentShop(client)?._id
