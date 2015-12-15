/*
 * Execute start up fixtures
 */

ReactionImport.startup = function () {
  ReactionImport.fixture().process(Assets.getText("private/data/Shops.json"), ["name"], ReactionImport.shop);
  ReactionImport.fixture().process(Assets.getText("private/data/Products.json"), ["title"], ReactionImport.load);
  ReactionImport.fixture().process(Assets.getText("private/data/Tags.json"), ["name"], ReactionImport.load);
  ReactionImport.flush();
};
