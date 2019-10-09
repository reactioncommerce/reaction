/* eslint-disable node/no-deprecated-api */
/* TODO: revisit `url.parse` throughout Reaction */
import url from "url";
import Logger from "@reactioncommerce/logger";
import config from "../config.js";
import sampleData from "./sampleData.js";

/**
 * @summary Loads sample dataset if collections are empty
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default async function loadSampleData(context) {
  if (config.SKIP_FIXTURES) return;

  const {
    appEvents,
    collections: {
      NavigationItems,
      NavigationTrees,
      Products,
      Shops,
      Tags
    },
    rootUrl,
    simpleSchemas: {
      Product: ProductSchema,
      ProductVariant: ProductVariantSchema,
      Shop: ShopSchema,
      Tag: TagSchema
    }
  } = context;

  // Only import sample data if all of the relevant collections are empty
  const anyShop = await Shops.findOne({});

  if (!anyShop) {
    // Shops
    Logger.info("Loading sample shops...");

    // Ensure there's only one primary shop in the sample data
    const primaryShopCount = sampleData.shops.filter((shop) => shop.shopType === "primary").length;
    if (primaryShopCount > 1) {
      throw new Error("More than one primary shop in the sample dataset");
    }

    const currentDomain = rootUrl && url.parse(rootUrl).host;

    const shopInsertPromises = sampleData.shops.map(async (shop) => {
      // add the current domain to the shop if it doesn't already exist
      let { domains } = shop;
      if (currentDomain && (!Array.isArray(domains) || !domains.includes(currentDomain))) {
        if (!Array.isArray(domains)) domains = [];
        domains.push(currentDomain);
      }

      const now = new Date();
      const finalShop = {
        ...shop,
        createdAt: now,
        domains,
        updatedAt: now
      };

      ShopSchema.validate(finalShop);

      await Shops.insertOne(finalShop);

      await appEvents.emit("afterShopCreate", { createdBy: null, shop });
    });

    // Ensure all shops have been inserted before continuing
    await Promise.all(shopInsertPromises);
  }

  // Tags
  if (Array.isArray(sampleData.tags)) {
    const anyTag = await Tags.findOne({});
    if (!anyTag) {
      Logger.info("Loading sample tags...");
      TagSchema.validate(sampleData.tags);
      await Tags.insertMany(sampleData.tags);
    }
  }

  // Products
  if (Array.isArray(sampleData.products)) {
    const anyProducts = await Products.findOne({});
    if (!anyProducts) {
      Logger.info("Loading sample products...");

      sampleData.products.forEach((product) => {
        if (product.ancestors.length === 0) {
          ProductSchema.validate(product);
        } else {
          ProductVariantSchema.validate(product);
        }
      });

      await Products.insertMany(sampleData.products);

      // Immediately publish them to the catalog, too
      const topProductIds = sampleData.products.reduce((list, product) => {
        if (product.ancestors.length === 0) {
          list.push(product._id);
        }
        return list;
      }, []);
      await context.mutations.publishProducts({ ...context, isInternalCall: true }, topProductIds);
    }
  }

  // Navigation
  const anyNavigationItems = await NavigationItems.findOne({});
  const anyNavigationTrees = await NavigationTrees.findOne({});

  if (!anyNavigationItems && !anyNavigationTrees) {
    if (Array.isArray(sampleData.navigationItems)) {
      Logger.info("Loading navigation items...");
      await NavigationItems.insertMany(sampleData.navigationItems);
    }

    if (Array.isArray(sampleData.navigationTrees)) {
      Logger.info("Loading navigation trees...");
      await NavigationTrees.insertMany(sampleData.navigationTrees);
    }
  }
}
