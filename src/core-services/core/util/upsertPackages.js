import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import layouts from "./layouts.js";

/**
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function upsertPackages(context) {
  const {
    app,
    collections: {
      Packages,
      Shops
    }
  } = context;
  const { registeredPlugins } = app;

  const shops = await Shops.find({}).toArray();
  const pluginNameList = Object.keys(registeredPlugins);
  const totalPackages = pluginNameList.length;
  let loadedIndex = 1;

  /* eslint-disable no-await-in-loop */
  for (const config of Object.values(registeredPlugins)) {
    // Build a single combined layouts list to save on all shops later
    if (config.layout) {
      // filter out layout Templates
      for (const item of config.layout) {
        if (item.layout) {
          layouts.push(item);
        }
      }
    }

    for (const shop of shops) {
      const shopId = shop._id;
      if (!shopId) return;

      // Look up an existing package doc. The `settings` field is the one we want
      // to keep as is if the doc already exists.
      const existingDoc = await Packages.findOne({ name: config.name, shopId }, {
        projection: {
          settings: 1
        }
      });

      const packageDoc = {
        // autoEnable no longer does anything. All are enabled by default.
        enabled: true,
        icon: config.icon,
        layout: config.layout,
        name: config.name,
        registry: config.registry,
        version: config.version,
        settings: {
          ...(config.settings || {}),
          ...((existingDoc && existingDoc.settings) || {})
        },
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

      Logger.debug(`${loadedIndex}/${totalPackages}: Loaded package ${config.name} for shop ${shopId}`);
      loadedIndex += 1;
    }
  }
  /* eslint-enable no-await-in-loop */

  // Save layouts array on all shops
  await Shops.updateMany({}, { $set: { layout: layouts } });

  // Now delete Packages documents for any plugins that are not present
  await Packages.deleteMany({
    name: { $nin: pluginNameList }
  });
}
