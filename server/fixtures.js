Meteor.startup(function() {
  if (!ReactionConfig.find().count()) {
    var filepickerPackage = ReactionPackages.findOne({name: "reaction-filepicker"});
    var metafields = filepickerPackage.metafields;
    metafields.apikey = Meteor.settings.filepickerApiKey;
    ReactionConfig.insert({
      userId: "sp8nAatBMw7cXKLjc",
      packageId: filepickerPackage._id,
      name: filepickerPackage.name,
      label: filepickerPackage.label,
      enabled:true,
      metafields: metafields
    });
//    var googleAnalyticsPackage = ReactionPackages.findOne({name: "reaction-google-analytics"});
//    var metafields = filepickerPackage.metafields;
//    metafields.apikey = Meteor.settings.filepickerApiKey;
//    ReactionConfig.insert({
//      userId: "sp8nAatBMw7cXKLjc",
//      packageId: filepickerPackage._id,
//      name: filepickerPackage.name,
//      label: filepickerPackage.label,
//      enabled:true,
//      metafields: metafields
//    });
  }
});
