import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { Fixture } from "/server/api/core/importer";

export default function loadData() {
  if (!process.env.SKIP_FIXTURES) {
    /**
     * Hook to setup core additional imports during Reaction init (shops process first)
     */
    Logger.info("Load default data from /private/data/");

    // Since import overwrites, only import Shops when none exist
    if (!Reaction.getShopId()) {
      try {
        Logger.debug("Loading Shop Data");
        Reaction.Importer.process(Assets.getText("data/Shops.json"), ["name"], Reaction.Importer.shop);
        // ensure Shops are loaded first.
        Reaction.Importer.flush(Shops);
      } catch (error) {
        Logger.error(error, "Bypassing loading Shop default data");
      }

      // make sure the default shop has been created before going further
      while (!Reaction.getShopId()) {
        Logger.debug("Loading default shop, waiting until it's ready before moving on...");
        Meteor._sleepForMs(1000);
      }
    }

    try {
      Logger.debug("Loading Shipping Data");
      Fixture.process(Assets.getText("data/Shipping.json"), ["name"], Reaction.Importer.shipping);
    } catch (error) {
      Logger.error(error, "Bypassing loading Shipping default data.");
    }

    try {
      Logger.debug("Loading Product Data");
      Fixture.process(Assets.getText("data/Products.json"), ["title"], Reaction.Importer.product);
    } catch (error) {
      Logger.error(error, "Bypassing loading Products default data.");
    }

    try {
      Logger.debug("Loading Tag Data");
      Fixture.process(Assets.getText("data/Tags.json"), ["name"], Reaction.Importer.tag);
    } catch (error) {
      Logger.error(error, "Bypassing loading Tags default data.");
    }
    //
    // these will flush and import with the rest of the imports from core init.
    // but Bulk.find.upsert() = false
    //
    Fixture.flush();
  }
}
