import Random from "@reactioncommerce/random";
import layouts from "./util/layouts.js";
import loadSampleData from "./util/loadSampleData.js";
import upsertPackages from "./util/upsertPackages.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function startup(context) {
  const { appEvents } = context;

  await loadSampleData(context);
  await upsertPackages(context);

  appEvents.on("afterShopCreate", async ({ shop }) => {
    const {
      app,
      collections: {
        Packages,
        Shops
      }
    } = context;

    const { _id: shopId } = shop;

    // Save layouts array on all shops
    await Shops.updateOne({ _id: shopId }, { $set: { layout: layouts } });

    // Create Packages docs for each plugin for this shop
    /* eslint-disable no-await-in-loop */
    for (const config of Object.values(app.registeredPlugins)) {
      const packageDoc = {
        // autoEnable no longer does anything. All are enabled by default.
        enabled: true,
        icon: config.icon,
        layout: config.layout,
        name: config.name,
        registry: config.registry,
        version: config.version,
        shopId
      };

      await Packages.updateOne({
        name: config.name,
        shopId
      }, {
        $set: packageDoc,
        $setOnInsert: {
          _id: Random.id()
        }
      }, {
        upsert: true
      });
    }
    /* eslint-enable no-await-in-loop */
  });
}
