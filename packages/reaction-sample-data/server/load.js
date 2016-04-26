import { Shops } from "/lib/collections";
import { Hooks, Logger } from "/server/api";

/**
 * Hook to setup core additional imports during ReactionCore init (shops process first)
 */

Hooks.Events.add("onCoreInit", () => {
  Logger.info("Initialize using reaction-sample-data");
  ReactionImport.fixture().process(Assets.getText("private/data/Shops.json"), ["name"], ReactionImport.shop);
  // ensure Shops are loaded first.
  ReactionImport.flush(Shops);
  // these will flush/import with the rest of the imports from core init.
  ReactionImport.fixture().process(Assets.getText("private/data/Products.json"), ["title"], ReactionImport.load);
  ReactionImport.fixture().process(Assets.getText("private/data/Tags.json"), ["name"], ReactionImport.load);
  ReactionImport.flush();
});
