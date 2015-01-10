colors = Npm.require 'colors'
###
# Fixtures is a global object that it can be reused in packages
# assumes collection data in reaction-core/private/data, optionally jsonFile
# use jsonFile when calling from another package, as we can't read the assets from here
# ex:
#   jsonFile =  Assets.getText("private/data/Shipping.json")
#   Fixtures.loadData ReactionCore.Collections.Shipping, jsonFile
###
PackageFixture = ->
  loadData: (collection, jsonFile) ->
    return if collection.find().count() > 0
    console.log "Loading fixture data for "+collection._name if Meteor.settings.isDebug
    unless jsonFile
      json = EJSON.parse Assets.getText("private/data/"+collection._name+".json")
    else
      json = EJSON.parse jsonFile

    for item,value in json
      collection._collection.insert item, (error, result) ->
        if error
          console.log (error + "Error adding " + value + " items to " + collection._name).red
          return false
    if value > 0
      console.log ("Success adding " + value + " items to " + collection._name).green if Meteor.settings.isDebug
      return
    else
      console.log ("No data imported to " + collection._name).yellow if Meteor.settings.isDebug
      return

  loadI18n: (collection) ->
    return if collection.find().count() > 0
    languages = ["ar","cs","de","en","es","fr","he","it","my","pl","pt","ru","sl","sv","vi"]
    console.log "Loading fixture data for languages to " + collection._name if Meteor.settings.isDebug
    for language in languages
      json = EJSON.parse Assets.getText("private/data/i18n/"+language+".json")
      for item,value in json
        collection._collection.insert item, (error, result) ->
          if error
            console.log (error + "Error adding " + language + " items to " + collection._name).red
            return
        console.log ("Success adding "+ language + " to " + collection._name).green if Meteor.settings.isDebug

# instantiate fixtures
@Fixtures = new PackageFixture

# helper for creating admin users
getDomain = (url) ->
  unless url then url = process.env.ROOT_URL
  domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
  return domain

###
# Three methods to create users default (empty db) admin user
###
createDefaultAdminUser = ->
  # options from set env variables
  options = {}
  options.email = process.env.METEOR_EMAIL #set in env if we want to supply email
  options.username = process.env.METEOR_USER
  options.password = process.env.METEOR_AUTH
  domain = getDomain()

  # options from mixing known set ENV production variables
  if process.env.METEOR_EMAIL
    url = process.env.MONGO_URL #pull from default db connect string
    options.username = "Administrator"
    unless options.password then options.password = url.substring(url.indexOf("/") + 2,url.indexOf("@")).split(":")[1]
    console.log ("\nIMPORTANT! DEFAULT USER INFO (ENV)\n  EMAIL/LOGIN: " + options.email + "\n  PASSWORD: " + options.password + "\n")
  else
    # random options if nothing has been set
    options.username = Meteor.settings?.reaction?.METEOR_USER || "Administrator"
    options.password = Meteor.settings?.reaction?.METEOR_AUTH || Random.secret(8)
    options.email = Meteor.settings?.reaction?.METEOR_EMAIL || Random.id(8).toLowerCase() + "@" + domain
    console.log ("\nIMPORTANT! DEFAULT USER INFO (RANDOM)\n  EMAIL/LOGIN: " + options.email + "\n  PASSWORD: " + options.password + "\n")

  accountId = Accounts.createUser options
  Roles.addUsersToRoles accountId, ['manage-users','owner','admin']
  shopId = Shops.findOne()._id
  Shops.update shopId,
    $set:
      ownerId: accountId
      email: options.email
    $push:
      members:
        isAdmin: true
        userId: accountId
        permissions: [
            "dashboard/customers",
            "dashboard/products",
            "dashboard/settings",
            "dashboard/settings/account",
            "dashboard/orders"
            ]

###
# load core fixture data
###
loadFixtures = ->
  # Load data from json files
  Fixtures.loadData ReactionCore.Collections.Products
  Fixtures.loadData ReactionCore.Collections.Shops
  Fixtures.loadData ReactionCore.Collections.Tags
  Fixtures.loadI18n ReactionCore.Collections.Translations

  # Load data from settings/json files
  unless Accounts.loginServiceConfiguration.find().count()
    if Meteor.settings.public?.facebook?.appId
      Accounts.loginServiceConfiguration.insert
        service: "facebook",
        appId: Meteor.settings.public.facebook.appId,
        secret: Meteor.settings.facebook.secret

  # Loop through ReactionCore.Packages object, which now has all packages added by
  # calls to register
  # removes package when removed from meteor, retriggers when package added
  unless ReactionCore.Collections.Packages.find().count() is Object.keys(ReactionCore.Packages).length
    _.each ReactionCore.Packages, (config, pkgName) ->
      Shops.find().forEach (shop) ->
        console.log ("Initializing "+ pkgName).cyan if Meteor.settings.isDebug
        ReactionCore.Collections.Packages.upsert {shopId: shop._id, name: pkgName},
          $setOnInsert:
            enabled: !!config.autoEnable
            settings: config.defaultSettings
    # remove unused packages
    Shops.find().forEach (shop) ->
      ReactionCore.Collections.Packages.find().forEach (pkg) ->
        unless _.has(ReactionCore.Packages, pkg.name)
          console.log ("Removing "+ pkg.name).red
          ReactionCore.Collections.Packages.remove {shopId: shop._id, name: pkg.name}

  # create default admin user account
  createDefaultAdminUser() unless Meteor.users.find().count()
  console.log("=> Reaction Commerce ready at: ".bold.yellow + " " + Meteor.absoluteUrl());

###
# Execute start up fixtures
###
Meteor.startup ->
  loadFixtures()
  if Meteor.settings.public?.isDebug
    Meteor.setInterval(loadFixtures, 300)


  # data conversion:  if ROOT_URL changes update shop domain
  # for now, we're assuming the first domain is the primary
  currentDomain = Shops.findOne().domains[0]
  if currentDomain isnt getDomain()
    console.log "Updating domain to " + getDomain()
    Shops.update({domains:currentDomain},{$set:{"domains.$":getDomain()}})

  # data conversion: we now set sessionId or userId, but not both
  Cart.update {userId: { $exists : true, $ne : null }, sessionId: { $exists : true }}, {$unset: {sessionId: ""}}, {multi: true}