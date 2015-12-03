/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionImport.process(Assets.getText("private/data/Shops.json"), ["name"], ReactionImport.shop);
  ReactionImport.flush();
  // start checking once per second if Shops collection is ready,
  // then load the rest of the fixtures when it is
  let wait = Meteor.setInterval(function () {
    if (!!ReactionCore.Collections.Shops.find().count()) {
      Meteor.clearInterval(wait);
      ReactionImport.fixture().process(Assets.getText("private/data/Tags.json"), ["name"], ReactionImport.load);
      ReactionImport.fixture().process(Assets.getText("private/data/Products.json"), ["title"], ReactionImport.load);
      ReactionImport.flush();
      ReactionRegistry.createDefaultAdminUser();
      // we've finished all reaction core initialization
      ReactionCore.Log.info("Reaction Core initialization finished.");
    }
  }, 1000);
  // load package configurations
  if (ReactionCore.Collections.Shops.find().count()) {
    ReactionRegistry.setDomain();
    ReactionRegistry.loadPackages();
  }
  return true;
});
