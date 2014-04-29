###
# Fixture - we always want a record
###
Meteor.startup ->
  unless Packages.findOne({name:"reaction-google-analytics"})
    console.log  "Adding google analytics fixture data:", Meteor.settings?.googleAnalyticsProperty
    Shops.find().forEach (shop) ->
      Packages.insert
        shopId: shop._id
        name: "reaction-google-analytics"
        property: Meteor.settings?.googleAnalyticsProperty