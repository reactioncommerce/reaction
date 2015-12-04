/*
 * Execute start up fixtures
 */

Meteor.startup(function () {
  ReactionImport.process(Assets.getText("private/data/Shops.json"), ["name"], ReactionImport.shop);
  ReactionImport.fixture().process(Assets.getText("private/data/Tags.json"), ["name"], ReactionImport.load);
  ReactionImport.fixture().process(Assets.getText("private/data/Products.json"), ["title"], ReactionImport.load);
  ReactionImport.flush();
});
