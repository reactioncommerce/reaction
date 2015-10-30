/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  try {
    Fixtures.loadData(ReactionCore.Collections.Shops, Assets.getText("private/data/Shops.json"));
    // start checking once per second if Shops collection is ready,
    // then load the rest of the fixtures when it is
    let wait = Meteor.setInterval(function () {
      if (!!ReactionCore.Collections.Shops.find().count()) {
        Meteor.clearInterval(wait);
        Fixtures.loadI18n(ReactionCore.Collections.Translations);
        Fixtures.loadData(ReactionCore.Collections.Products, Assets.getText("private/data/Products.json"));
        Fixtures.loadData(ReactionCore.Collections.Tags, Assets.getText("private/data/Tags.json"));
        // create default admin user
        ReactionRegistry.createDefaultAdminUser();
        // we've finished all reaction core initialization
        ReactionCore.Log.info("Reaction Core initialization finished.");
      }
    }, 1000);
  } catch (error) {
    ReactionCore.Log.error("loadFixtures: ", error.message);
  }
  return true;
});
