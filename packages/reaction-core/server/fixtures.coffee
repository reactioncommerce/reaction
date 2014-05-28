# *****************************************************
# fixtures for empty / test stores
# loads data from the private/data directory
# json, wrapped as an array
# can be imported using loadData(collection)
# individual packages have their own fixtures
# *****************************************************
colors = Npm.require('colors')

loadData = (collection) ->
  console.log "Loading fixture data for "+collection._name
  json = EJSON.parse Assets.getText("private/data/"+collection._name+".json")
  for item,value in json
    collection._collection.insert item, (error, result) ->
      console.log error if error?
  console.log ("Successfully added "+value+" items to "+ collection._name).green

share.loadFixtures = ->
  # Load data from json files
  loadData Products unless Products.find().count()
  createDefaultAdminUser() unless Meteor.users.find().count()
  loadData Shops unless Shops.find().count()
  loadData Tags unless Tags.find().count()
  loadData ConfigData unless ConfigData.find().count()
  # loadImageData "Images" unless Images.find().count()

  # Load data from settings/json files + base packages.
  unless Packages.find().count()
      console.log "Adding packages fixture data"
      Shops.find().forEach (shop) ->
        Packages.insert
          shopId: shop._id
          name: "reaction-commerce"

        Packages.insert
          shopId: shop._id
          name: "reaction-commerce-staff-accounts"

        Packages.insert
          shopId: shop._id
          name: "reaction-commerce-orders"

    unless Accounts.loginServiceConfiguration.find().count()
      if Meteor.settings.public?.facebook?.appId
        Accounts.loginServiceConfiguration.insert
          service: "facebook",
          appId: Meteor.settings.public.facebook.appId,
          secret: Meteor.settings.facebook.secret
###
# Three methods to create users default (empty db) admin user
###
createDefaultAdminUser = ->
  # options from set env variables
  options = {}
  options.email = process.env.METEOR_EMAIL #set in env if we want to supply email
  options.username = process.env.METEOR_USER
  options.password = process.env.METEOR_AUTH

  url = process.env.ROOT_URL
  domain = url.substring(url.indexOf("//") + 2)
  domain = domain.substring(0, domain.indexOf(":")).toLowerCase()

  # options from mixing known set ENV production variables
  unless options.username
    url = process.env.MONGO_URL #pull from default db connect string
    options.username = url.substring(url.indexOf("/") + 2,url.indexOf("@")).split(":")[0]
    unless options.username is "mongodb"
      options.password = url.substring(url.indexOf("/") + 2,url.indexOf("@")).split(":")[1]
      unless options.email
        options.email = url.substring(url.indexOf("/") + 2,url.indexOf("@")).split(":")[0] + "@" + domain
      console.log ("IMPORTANT! DEFAULT USER INFO (ENV) --->".red + " USER: " + options.username + " PASSWORD: " + options.password + " EMAIL: " + options.email)
    else
      # random options if nothing has been set
      options.username = Random.secret(6)
      options.password = Random.secret(8)
      options.email = options.username + "@" + domain
      console.log ("IMPORTANT! DEFAULT USER INFO (RANDOM) --->".red + " USER: " + options.username + " PASSWORD: " + options.password + " EMAIL: " + options.email)

  accountId = Accounts.createUser options
  Roles.addUsersToRoles accountId, ['manage-users','owner','admin']


Meteor.startup ->
  share.loadFixtures()

  if Meteor.settings.public?.isDebug
    Meteor.setInterval(share.loadFixtures, 300)
