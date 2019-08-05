import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const {
    appEvents,
    collections: {
      Assets,
      Translations
    }
  } = context;

  appEvents.on("afterShopCreate", async ({ shop }) => {
    const { _id: shopId } = shop;

    // Insert Translations documents for this shop
    const assets = await Assets.find({ type: "i18n" }).toArray();
    const translations = assets.map((assetDoc) => {
      const assetContent = JSON.parse(assetDoc.content);

      return {
        _id: Random.id(),
        ...assetContent[0],
        shopId
      };
    });

    await Translations.insertMany(translations);

    Logger.debug(`Created translation documents for shop ${shopId}`);
  });
}
