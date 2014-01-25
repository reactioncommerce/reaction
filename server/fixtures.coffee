# *****************************************************
# fixtures for empty / test stores
# loads data from the private/data directory
# json, wrapped as an array
# can be imported using loadData(collection)
# *****************************************************

loadData = (collection) ->
  console.log "Loading fixture data for "+collection._name
  json = EJSON.parse Assets.getText("data/"+collection._name+".json")
  for item,value in json
    collection._collection.insert item, (error, result) ->
      console.log error if error?
  console.log "Successfully added "+value+" items to "+ collection._name

share.loadFixtures = ->
  # Load data from json files
  loadData Products unless Products.find().count()
  loadData Customers unless Customers.find().count()
  loadData Meteor.users unless Meteor.users.find().count()
  loadData Shops unless Shops.find().count()
  loadData Tags unless Tags.find().count()
  loadData Cart unless Cart.find().count()
  loadData ConfigData unless ConfigData.find().count()

  # Load data from settings/json files + base packages.
  unless Packages.find().count()
      console.log "Adding packages fixture data"
      Shops.find().forEach (shop) ->
        Packages.insert
          shopId: shop._id
          name: "reaction-shop"

        Packages.insert
          shopId: shop._id
          name: "reaction-shop-staff-accounts"

        Packages.insert
          shopId: shop._id
          name: "reaction-shop-orders"

        Packages.insert
          shopId: shop._id
          name: "reaction-filepicker"
          apikey: Meteor.settings?.filepickerApiKey

        Packages.insert
          shopId: shop._id
          name: "reaction-google-analytics"
          property: Meteor.settings?.googleAnalyticsProperty

        Packages.insert
          shopId: shop._id
          name: "reaction-paypal"
          settings: Meteor.settings.paypal

    unless Accounts.loginServiceConfiguration.find().count()
      if Meteor.settings.public?.facebook?.appId
        Accounts.loginServiceConfiguration.insert
          service: "facebook",
          appId: Meteor.settings.public.facebook.appId,
          secret: Meteor.settings.facebook.secret

Meteor.startup ->
  share.loadFixtures()

  if Meteor.settings.public?.isDebug
    Meteor.setInterval(share.loadFixtures, 300)
