###
# Application Startup
# ReactionCore Server Configuration
###

###
# configure bunyan logging module for reaction server
# See: https://github.com/trentm/node-bunyan#levels
###
isDebug = Meteor?.settings?.public?.isDebug || process.env.REACTION_DEBUG || "INFO"

# acceptable levels
levels = ["FATAL","ERROR","WARN", "INFO", "DEBUG", "TRACE"]

# if debug is true, or NODE_ENV development environment and not false
# set to lowest level, or any defined level set to level
if isDebug is true or ( process.env.NODE_ENV is "development" and isDebug isnt false )
  # set logging levels from settings
  if typeof isDebug isnt 'boolean' and typeof isDebug isnt 'undefined' then isDebug = isDebug.toUpperCase()
  unless _.contains levels, isDebug
    isDebug = "WARN"

# Define bunyan levels and output to Meteor console
# init logging stream
if process.env.VELOCITY_CI is "1" #format screws with testing output
  formatOut = process.stdout
else
  formatOut = logger.format({ outputMode: 'short', levelInString: false})

# enable logging
ReactionCore.Events = logger.bunyan.createLogger(
  name: 'core'
  stream: (unless isDebug is "DEBUG" then formatOut else process.stdout )
  level: 'debug')

# set bunyan logging level
ReactionCore.Events.level(isDebug)


###
# ReactionCore methods (server)
###
_.extend ReactionCore,
  init: ->
    try
      ReactionRegistry.loadFixtures()
    catch e
      ReactionCore.Events.error e
    return true

  getCurrentShopCursor: (client) ->
    domain = @getDomain(client)
    cursor = Shops.find({domains: domain}, {limit: 1})
    if !cursor.count()
      ReactionCore.Events.debug "Reaction Configuration: Add a domain entry to shops for: ", domain
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

  # permission check
  hasPermission: (permissions) ->
    # shop specific check
    if Roles.userIsInRole Meteor.userId(), permissions, @getShopId()
      return true
    # global roles check
    else if Roles.userIsInRole Meteor.userId(), permissions, Roles.GLOBAL_GROUP
      return true
    for shop in @getSellerShopId()
      if Roles.userIsInRole Meteor.userId(), permissions, shop
        return true
    return false

  # owner access
  hasOwnerAccess: (client) ->
    ownerPermissions = ['owner']
    return @hasPermission ownerPermissions

  # admin access
  hasAdminAccess: (client) ->
    adminPermissions = ['owner','admin']
    return @hasPermission adminPermissions

  # dashboard access
  hasDashboardAccess: (client) ->
    dashboardPermissions = ['owner','admin','dashboard']
    return @hasPermission dashboardPermissions

  # return the logged in user's shop[s] if he owns any or if he is an admin -> used in multivendor
  getSellerShopId: (client) ->
    return Roles.getGroupsForUser Meteor.userId(), 'admin'

  # sets the shop mail server auth info
  # load priority: param, shop data, enviroment, settings
  configureMailUrl: (user, password, host, port) ->
    shopMail = ReactionCore.Collections.Packages.findOne({shopId: @getShopId(), name: "core"}).settings.mail
    # use configurMailUrl as a function
    if user and password and host and port
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL = "smtp://" + user + ":" + password + "@" + host + ":" + port + "/"
    # shops configuration
    else if shopMail.user and shopMail.password and shopMail.host and shopMail.port
      ReactionCore.Events.info "setting default mail url to: " + shopMail.host
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL =
          "smtp://" + shopMail.user + ":" + shopMail.password + "@" + shopMail.host + ":" + shopMail.port + "/"
    # Meteor.settings isn't standard, if you add it, respect over default
    else if Meteor.settings.MAIL_URL and not process.env.MAIL_URL
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL
    # default meteor env config
    unless process.env.MAIL_URL
      ReactionCore.Events.warn 'Mail server not configured. Unable to send email.'
      return false

###
# Execute start up fixtures
###
Meteor.startup ->
  # notifiy that we're done with initialization
  ReactionCore.init()
  ReactionCore.Events.info "Reaction Core initialization finished. "

