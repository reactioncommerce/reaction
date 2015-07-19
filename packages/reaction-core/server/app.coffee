###
# Application Startup
# ReactionCore Server Configuration
###

###
# ReactionCore methods (server)
###
_.extend ReactionCore,
  init: ->
    self = @
    ReactionRegistry.loadFixtures()
    ReactionCore.configureMailUrl()
    return self

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

    if user and password and host and port
      return process.env.MAIL_URL = Meteor.settings.MAIL_URL = "smtp://" + user + ":" + password + "@" + host + ":" + port + "/"

    else if shopMail.user and shopMail.password and shopMail.host and shopMail.port
      ReactionCore.Events.info "setting default mail url to: " + shopMail.host
      return process.env.MAIL_URL =
        Meteor.settings.MAIL_URL =
          "smtp://" + shopMail.user + ":" + shopMail.password + "@" + shopMail.host + ":" + shopMail.port + "/"

    unless Meteor.settings.MAIL_URL or process.env.MAIL_URL
      ReactionCore.Events.warn 'Mail server not configured. Unable to send email.'
      return false

###
# Execute start up fixtures
###
Meteor.startup ->
  # notifiy that we're done with initialization
  ReactionCore.init()
  ReactionCore.Events.info "Reaction Commerce initialization finished. "
