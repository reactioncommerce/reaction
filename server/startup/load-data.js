import { Shops } from "/lib/collections";
import { Hooks, Logger, Reaction } from "/server/api";

export default function () {
  /**
   * Hook to setup core additional imports during ReactionCore init (shops process first)
   */
  Hooks.Events.add("onCoreInit", () => {
    Logger.info("Initialize using reaction-sample-data");
    Reaction.Import.fixture().process(Assets.getText("data/Shops.json"), ["name"], Reaction.Import.shop);
    // ensure Shops are loaded first.
    Reaction.Import.flush(Shops);
    // these will flush/import with the rest of the imports from core init.
    Reaction.Import.fixture().process(Assets.getText("data/Products.json"), ["title"], Reaction.Import.load);
    Reaction.Import.fixture().process(Assets.getText("data/Tags.json"), ["name"], Reaction.Import.load);
    Reaction.Import.flush();
  });
}
