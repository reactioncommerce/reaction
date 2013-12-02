Meteor.startup(function() {
  if (!PackageConfigs.find().count()) {
    var metafields;
    var filepickerPackage = PackageConfigs.findOne({name: "reaction-filepicker"});
    metafields = filepickerPackage.metafields;
    metafields.apikey = Meteor.settings.filepickerApiKey;
    PackageConfigs.insert({
      userId: "sp8nAatBMw7cXKLjc",
      packageId: filepickerPackage._id,
      name: filepickerPackage.name,
      label: filepickerPackage.label,
      enabled:true,
      metafields: metafields
    });
    var googleAnalyticsPackage = PackageConfigs.findOne({name: "reaction-google-analytics"});
    metafields = googleAnalyticsPackage.metafields;
    _.each(metafields, function(metafield) {
      if (metafield.name == "property") {
        metafield.value = Meteor.settings.googleAnalyticsProperty
      }
    });
    PackageConfigs.insert({
      userId: "sp8nAatBMw7cXKLjc",
      packageId: googleAnalyticsPackage._id,
      name: googleAnalyticsPackage.name,
      label: googleAnalyticsPackage.label,
      enabled: true,
      metafields: metafields
    });
  }
});
