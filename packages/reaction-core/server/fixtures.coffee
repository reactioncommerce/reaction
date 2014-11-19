# *****************************************************
# fixtures for empty / test stores
# loads data from the private/data directory
# json, wrapped as an array
# can be imported using loadData(collection)
# individual packages have their own fixtures
# *****************************************************
colors = Npm.require 'colors'

getDomain = (url) ->
  unless url then url = process.env.ROOT_URL
  domain = url.match(/^https?\:\/\/([^\/:?#]+)(?:[\/:?#]|$)/i)[1]
  return domain

loadData = (collection) ->
  console.log "Loading fixture data for "+collection._name
  json = EJSON.parse Assets.getText("private/data/"+collection._name+".json")
  for item,value in json
    collection._collection.insert item, (error, result) ->
      if error
        console.log (error + "Error adding " + value + " items to " + collection._name).red
        return false
  if value > 0
    console.log ("Success adding " + value + " items to " + collection._name).green
    return
  else
    console.log ("No data imported to " + collection._name).yellow

loadI18n = (collection) ->
  languages = ["ar","cs","de","en","es","fr","he","it","pl","pt","ru","sl","sv","vi"]
  console.log "Loading fixture data for languages to " + collection._name
  for language in languages
    json = EJSON.parse Assets.getText("private/data/i18n/"+language+".json")
    for item,value in json
      collection._collection.insert item, (error, result) ->
        if error
          console.log (error + "Error adding " + language + " items to " + collection._name).red
          return
      console.log ("Success adding "+ language + " to " + collection._name).green



loadFixtures = ->
  # Load data from json files
  loadData ReactionCore.Collections.Products unless Products.find().count()
  loadData ReactionCore.Collections.Shops unless Shops.find().count()
  loadData ReactionCore.Collections.Tags unless Tags.find().count()
  loadI18n ReactionCore.Collections.Translations unless ReactionCore.Collections.Translations.find().count()
  # loadImageData "Images" unless Images.find().count()

  # Load data from settings/json files
  unless Accounts.loginServiceConfiguration.find().count()
    if Meteor.settings.public?.facebook?.appId
      Accounts.loginServiceConfiguration.insert
        service: "facebook",
        appId: Meteor.settings.public.facebook.appId,
        secret: Meteor.settings.facebook.secret

  # Loop through ReactionCore.Packages object, which now has all packages added by
  # calls to register
  # todo: add function to retrigger this
  unless ReactionCore.Collections.Packages.find().count()
    _.each ReactionCore.Packages, (config, pkgName) ->
      Shops.find().forEach (shop) ->
        console.log ("Initializing "+ pkgName).cyan
        ReactionCore.Collections.Packages.upsert {shopId: shop._id, name: pkgName},
          $setOnInsert:
            enabled: !!config.autoEnable
            settings: config.defaultSettings

  # create default admin user account
  createDefaultAdminUser() unless Meteor.users.find().count()
  console.log("=> Reaction Commerce ready at: ".bold.yellow + " " + Meteor.absoluteUrl());

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
    options.username = Meteor.settings?.reaction?.METEOR_USER ||"Administrator"
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