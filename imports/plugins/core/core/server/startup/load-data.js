import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Products, Shipping, Tags, Shops } from "/lib/collections";
import { Reaction } from "/server/api";
import { Fixture } from "/server/api/core/importer";

/**
 * Load fixture data into various collections if those collections are blank
 * @name loadData
 * @returns {undefined} No return value
 */
export default function loadData() {
  if (!process.env.SKIP_FIXTURES) {
    /**
     * Hook to setup core additional imports during Reaction init (shops process first)
     */
    Logger.info("Load default data from /private/data/");

    let shopId = Reaction.getShopId();
    // Since import overwrites, only import Shops when none exist
    if (!shopId) {
      try {
        Logger.debug("Loading Shop Data");
        Reaction.Importer.process(Assets.getText("data/Shops.json"), ["name"], Reaction.Importer.shop, [shopId]);
        // ensure Shops are loaded first.
        Reaction.Importer.flush(Shops);
      } catch (error) {
        Logger.error(error, "Bypassing loading Shop default data");
      }

      shopId = Reaction.getShopId();
      // make sure the default shop has been created before going further
      while (!shopId) {
        Logger.debug("Loading default shop, waiting until it's ready before moving on...");
        Meteor._sleepForMs(1000);
        shopId = Reaction.getShopId();
      }
    }

    // Import Shipping data
    if (Shipping.find().count() === 0) {
      try {
        Logger.debug("Loading Shipping Data");
        Fixture.process(Assets.getText("data/Shipping.json"), ["name"], Reaction.Importer.shipping, [shopId]);
      } catch (error) {
        Logger.error(error, "Bypassing loading Shipping default data.");
      }
    }

    // Import Product data
    if (Products.find().count() === 0) {
      try {
        Logger.debug("Loading Product Data");
        Fixture.process(Assets.getText("data/Products.json"), ["title"], Reaction.Importer.product, [shopId]);
      } catch (error) {
        Logger.error(error, "Bypassing loading Products default data.");
      }
    }

    // Import Tag data
    if (Tags.find().count() === 0) {
      try {
        Logger.debug("Loading Tag Data");
        Fixture.process(Assets.getText("data/Tags.json"), ["name"], Reaction.Importer.tag, [shopId]);
      } catch (error) {
        Logger.error(error, "Bypassing loading Tags default data.");
      }
    }
    //
    // these will flush and import with the rest of the imports from core init.
    // but Bulk.find.upsert() = false
    //
    Fixture.flush();
  }
}
