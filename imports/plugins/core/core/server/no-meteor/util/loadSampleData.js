import url from "url";
import Logger from "@reactioncommerce/logger";
import sampleData from "./sampleData";

/**
 * @summary Loads sample dataset if collections are empty
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function loadSampleData(context) {
  if (process.env.SKIP_FIXTURES) return;

  const {
    appEvents,
    collections: {
      Products,
      Shipping,
      Shops,
      Tags
    },
    rootUrl
  } = context;

  // Only import sample data if all of the relevant collections are empty
  const anyProducts = await Products.findOne({});
  const anyShipping = await Shipping.findOne({});
  const anyShop = await Shops.findOne({});
  const anyTag = await Tags.findOne({});

  if (anyProducts || anyShipping || anyShop || anyTag) {
    Logger.debug("Not loading sample data because there are already documents");
    return;
  }

  // Shops
  Logger.info("Loading sample shops...");

  // Ensure there's only one primary shop in the sample data
  const primaryShopCount = sampleData.shops.filter((shop) => shop.shopType === "primary").length;
  if (primaryShopCount > 1) {
    throw new Error("More than one primary shop in the sample dataset");
  }

  const currentDomain = rootUrl && url.parse(rootUrl).hostname;

  const shopInsertPromises = sampleData.shops.map(async (shop) => {
    // add the current domain to the shop if it doesn't already exist
    if (currentDomain && (!Array.isArray(shop.domains) || !shop.domains.includes(currentDomain))) {
      if (!Array.isArray(shop.domains)) shop.domains = [];
      shop.domains.push(currentDomain);
    }

    await Shops.insertOne(shop);

    await appEvents.emit("afterShopCreate", { createdBy: null, shop });
  });

  // Ensure all shops have been inserted before continuing
  await Promise.all(shopInsertPromises);

  // Tags
  if (Array.isArray(sampleData.tags)) {
    Logger.info("Loading sample tags...");
    await Tags.insertMany(sampleData.tags);
  }

  // Products
  if (Array.isArray(sampleData.products)) {
    Logger.info("Loading sample products...");
    await Products.insertMany(sampleData.products);
  }
}
