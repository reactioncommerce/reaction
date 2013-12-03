Meteor.startup(function () {
  if (!PackageConfigs.find().count()) {
    console.log("Adding packages fixture data")
    Shops.find().forEach(function (shop) {
      PackageConfigs.insert({
        shopId: shop._id,
        name: "reaction-shop"
      });
      PackageConfigs.insert({
        shopId: shop._id,
        name: "reaction-shop-orders"
      });
      PackageConfigs.insert({
        shopId: shop._id,
        name: "reaction-greetramp"
      });
      PackageConfigs.insert({
        shopId: shop._id,
        name: "reaction-filepicker",
        apikey: Meteor.settings.filepickerApiKey
      });
      PackageConfigs.insert({
        shopId: shop._id,
        name: "reaction-google-analytics",
        property: Meteor.settings.googleAnalyticsProperty
      });
    })
  }
});
