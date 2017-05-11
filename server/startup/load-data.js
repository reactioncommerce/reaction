import { Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { Fixture } from "/server/api/core/import";

export default function () {
  /**
   * Hook to setup core additional imports during Reaction init (shops process first)
   */
  Logger.info("Load default data from /private/data/");

  try {
    Reaction.Import.process(Assets.getText("data/Shops.json"), ["name"], Reaction.Import.shop);
    // ensure Shops are loaded first.
    Reaction.Import.flush(Shops);
  } catch (error) {
    Logger.info("Bypassing loading Shop default data");
  }

  try {
    Fixture.process(Assets.getText("data/Shipping.json"), ["name"], Reaction.Import.shipping);
  } catch (error) {
    Logger.info("Bypassing loading Shipping default data.");
  }

  try {
    Fixture.process(Assets.getText("data/Products.json"), ["title"], Reaction.Import.load);
  } catch (error) {
    Logger.info("Bypassing loading Products default data.");
  }

  try {
    Fixture.process(Assets.getText("data/Tags.json"), ["name"], Reaction.Import.load);
  } catch (error) {
    Logger.info("Bypassing loading Tags default data.");
  }
  //
  // these will flush and import with the rest of the imports from core init.
  // but Bulk.find.upsert() = false
  //
  Fixture.flush();
}
