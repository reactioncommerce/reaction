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
    collections: {
      NavigationItems,
      NavigationTrees,
      Products,
      Tags
    },
    simpleSchemas: {
      Product: ProductSchema,
      ProductVariant: ProductVariantSchema,
      Tag: TagSchema
    }
  } = context;

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
