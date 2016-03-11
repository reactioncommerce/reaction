/**
 * Hook to setup core additional imports during ReactionCore init (shops process first)
 */
if (ReactionCore && ReactionCore.Hooks) {
  ReactionCore.Hooks.Events.add("onCoreInit", () => {
    ReactionImport.fixture().process(Assets.getText("private/data/Shops.json"), ["name"], ReactionImport.shop);
    // ensure Shops are loaded first.
    ReactionImport.flush();
    // these will flush/import with the rest of the imports from core init.
    ReactionImport.fixture().process(Assets.getText("private/data/Products.json"), ["title"], ReactionImport.load);
    ReactionImport.fixture().process(Assets.getText("private/data/Tags.json"), ["name"], ReactionImport.load);
  });
}
