/* eslint-disable require-jsdoc */
import isEqual from "lodash/isEqual";

const ALL_FIELDS = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

const DEFAULT_SELLABLE_INFO = {
  canBackorder: true,
  inventoryAvailableToSell: 0,
  inventoryInStock: 0,
  inventoryReserved: 0,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false
};

const DEFAULT_SOLD_OUT_INFO = {
  canBackorder: false,
  inventoryAvailableToSell: 0,
  inventoryInStock: 0,
  inventoryReserved: 0,
  isBackorder: false,
  isLowQuantity: true,
  isSoldOut: true
};

// Similar to /imports/plugins/core/settings/server/queries/appSettings.js
async function appSettings(context, shopId = null) {
  const { collections } = context;
  const { AppSettings } = collections;

  const settings = (await AppSettings.findOne({ shopId })) || {};

  // Use default if not found
  if (settings.canSellVariantWithoutInventory !== true && settings.canSellVariantWithoutInventory !== false) {
    settings.canSellVariantWithoutInventory = true;
  }

  return settings;
}

// Similar to /imports/plugins/included/simple-inventory/server/no-meteor/utils/inventoryForProductConfigurations.js
async function simpleInventoryForProductConfigurations(context, input) {
  const { productConfigurations } = input;
  const { collections, dataLoaders } = context;

  const productVariantIds = productConfigurations.map(({ productVariantId }) => productVariantId);

  const inventoryDocs = dataLoaders
    ? await dataLoaders.SimpleInventoryByProductVariantId.loadMany(productVariantIds)
    : await collections.SimpleInventory
      .find({
        "productConfiguration.productVariantId": { $in: productVariantIds }
      })
      .limit(productConfigurations.length) // optimize query speed
      .toArray();

  return productConfigurations.map((productConfiguration) => {
    const inventoryDoc = inventoryDocs.find((doc) => {
      if (!doc) return false;
      return isEqual(productConfiguration, doc.productConfiguration);
    });
    if (!inventoryDoc || !inventoryDoc.isEnabled) {
      return {
        inventoryInfo: null,
        productConfiguration
      };
    }

    const { canBackorder, lowInventoryWarningThreshold } = inventoryDoc;
    let { inventoryInStock, inventoryReserved } = inventoryDoc;
    inventoryInStock = Math.max(0, inventoryInStock);
    inventoryReserved = Math.max(0, inventoryReserved);
    const inventoryAvailableToSell = Math.max(0, inventoryInStock - inventoryReserved);
    const isLowQuantity = inventoryAvailableToSell <= lowInventoryWarningThreshold;

    return {
      inventoryInfo: {
        canBackorder,
        inventoryAvailableToSell,
        inventoryInStock,
        inventoryReserved,
        isLowQuantity
      },
      productConfiguration
    };
  });
}

/**
 * @summary Gets inventory results for multiple product configs
 * @private
 * @param {Object} context App context
 * @param {Object} input Input
 * @returns {Object[]} Array of result objects
 */
async function getInventoryResults(context, input) {
  const { productConfigurations, shopId } = input;

  // If there are multiple plugins providing inventory, we use the first one that has a response
  // for each product configuration.
  const results = [];
  let remainingProductConfigurations = productConfigurations;
  const inventoryFns = [simpleInventoryForProductConfigurations];
  for (const inventoryFn of inventoryFns) {
    // eslint-disable-next-line no-await-in-loop
    const pluginResults = await inventoryFn(context, input);

    // Add only those with inventory info to final results.
    // Otherwise add to sellableProductConfigurations for next run
    remainingProductConfigurations = [];
    for (const pluginResult of pluginResults) {
      if (pluginResult.inventoryInfo) {
        // Add fields that we calculate here so that each plugin doesn't have to
        pluginResult.inventoryInfo.isSoldOut = pluginResult.inventoryInfo.inventoryAvailableToSell === 0;
        pluginResult.inventoryInfo.isBackorder = pluginResult.inventoryInfo.isSoldOut && pluginResult.inventoryInfo.canBackorder;
        results.push(pluginResult);
      } else {
        remainingProductConfigurations.push(pluginResult.productConfiguration);
      }
    }

    if (remainingProductConfigurations.length === 0) break; // found inventory info for every product config
  }

  // If no inventory info was found for some of the product configs, such as
  // if there are no plugins providing inventory info, then use default info
  // that allows the product to be purchased always.
  if (remainingProductConfigurations.length > 0) {
    const { canSellVariantWithoutInventory } = await appSettings(context, shopId);
    const inventoryInfo = canSellVariantWithoutInventory ? DEFAULT_SELLABLE_INFO : DEFAULT_SOLD_OUT_INFO;
    for (const productConfiguration of remainingProductConfigurations) {
      results.push({ inventoryInfo, productConfiguration });
    }
  }

  return results;
}

// Similar to /imports/plugins/core/inventory/server/no-meteor/queries/inventoryForProductConfigurations.js
export default async function inventoryForProductConfigurations(context, input) {
  const { collections } = context;
  const { Products } = collections;

  const { fields = ALL_FIELDS, productConfigurations, shopId } = input;

  // Inventory plugins are expected to provide inventory info only for sellable variants.
  // If there are any non-sellable parent variants in the list, we remove them now.
  // We'll aggregate their child option values after we get them.
  const parentVariantProductConfigurations = [];
  const sellableProductConfigurations = [];
  for (const productConfiguration of productConfigurations) {
    const { isSellable, ...coreProductConfiguration } = productConfiguration;
    if (isSellable) {
      sellableProductConfigurations.push(coreProductConfiguration);
    } else {
      parentVariantProductConfigurations.push(coreProductConfiguration);
    }
  }

  // Get results for sellable product configs
  const results = await getInventoryResults(context, {
    fields,
    productConfigurations: sellableProductConfigurations,
    shopId
  });

  // Now it's time to calculate top-level variant aggregated inventory and add those to the results.
  // For non-sellable (parent) variants, we need to get inventory for all of their options
  // and calculate aggregated values from them.
  let childOptionResults = [];
  if (parentVariantProductConfigurations.length) {
    const variantIds = parentVariantProductConfigurations.map(({ productVariantId }) => productVariantId);
    const allOptions = await Products.find({
      ancestors: { $in: variantIds }
    }, {
      projection: {
        ancestors: 1
      }
    }).toArray();

    childOptionResults = await getInventoryResults(context, {
      fields,
      productConfigurations: allOptions.map((option) => ({
        productId: option.ancestors[0],
        productVariantId: option._id
      })),
      shopId
    });

    for (const productConfiguration of parentVariantProductConfigurations) {
      const childOptions = allOptions.filter((option) => option.ancestors.includes(productConfiguration.productVariantId));
      const childOptionsInventory = childOptions.reduce((list, option) => {
        const optionResult = childOptionResults.find((result) => result.productConfiguration.productVariantId === option._id);
        if (optionResult) list.push(optionResult.inventoryInfo);
        return list;
      }, []);
      results.push({
        productConfiguration,
        inventoryInfo: {
          canBackorder: childOptionsInventory.some((option) => option.canBackorder),
          inventoryAvailableToSell: childOptionsInventory.reduce((sum, option) => sum + option.inventoryAvailableToSell, 0),
          inventoryInStock: childOptionsInventory.reduce((sum, option) => sum + option.inventoryInStock, 0),
          inventoryReserved: childOptionsInventory.reduce((sum, option) => sum + option.inventoryReserved, 0),
          isBackorder: childOptionsInventory.every((option) => option.isBackorder),
          isLowQuantity: childOptionsInventory.some((option) => option.isLowQuantity),
          isSoldOut: childOptionsInventory.every((option) => option.isSoldOut)
        }
      });
    }
  }

  return results;
}

/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export async function transformInventoryOnCatalog(catalogProduct, { context }) {
  const { productId, shopId } = catalogProduct;

  // Most inventory information is looked up and included at read time, when
  // preparing a response to a GraphQL query, but we need to store some
  // boolean flags in the Catalog collection to enable sorting
  // catalogItems query results by them and to have them in Elasticsearch.
  // Build a productConfigurations array based on what's currently in `catalogProduct` object
  const productConfigurations = [];
  const hiddenAndDeletedVariants = [];
  catalogProduct.variants.forEach((variant) => {
    productConfigurations.push({
      isSellable: !variant.options || variant.options.length === 0,
      productId,
      productVariantId: variant.variantId
    });

    if (variant.isDeleted || !variant.isVisible) {
      hiddenAndDeletedVariants.push(variant.variantId);
    }

    if (variant.options) {
      variant.options.forEach((option) => {
        productConfigurations.push({
          isSellable: true,
          productId,
          productVariantId: option.variantId
        });

        if (option.isDeleted || !option.isVisible) {
          hiddenAndDeletedVariants.push(option.variantId);
        }
      });
    }
  });

  // Retrieve inventory information for all top level variants and all options
  const topVariantsAndOptionsInventory = await inventoryForProductConfigurations(context, {
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    productConfigurations,
    shopId
  });

  // Add inventory properties to the top level parent product.
  // For this we need to filter out any invisible or deleted.
  const visibleTopVariantsAndOptionsInventory = topVariantsAndOptionsInventory.filter(({ productConfiguration }) =>
    !hiddenAndDeletedVariants.includes(productConfiguration.productVariantId));

  catalogProduct.isBackorder = visibleTopVariantsAndOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isBackorder);
  catalogProduct.isLowQuantity = visibleTopVariantsAndOptionsInventory.some(({ inventoryInfo }) => inventoryInfo.isLowQuantity);
  catalogProduct.isSoldOut = visibleTopVariantsAndOptionsInventory.every(({ inventoryInfo }) => inventoryInfo.isSoldOut);

  // add inventory props to each top level Variant
  catalogProduct.variants.forEach((variant) => {
    // attempt to find this variant's inventory info
    const foundVariantInventory = topVariantsAndOptionsInventory.find((inventoryInfo) =>
      inventoryInfo.productConfiguration.productVariantId === variant.variantId);

    // This should never happen but we include a check to be safe
    if (!foundVariantInventory || !foundVariantInventory.inventoryInfo) {
      throw new Error("inventory-info-not-found", `Inventory info not found for variant with ID: ${variant.variantId}`);
    }

    // if inventory info was found, add to variant
    variant.isSoldOut = foundVariantInventory.inventoryInfo.isSoldOut;

    // add inventory props to each top level option
    if (variant.options) {
      variant.options.forEach((option) => {
        const foundOptionInventory = topVariantsAndOptionsInventory.find((inventoryInfo) =>
          inventoryInfo.productConfiguration.productVariantId === option.variantId);

        // This should never happen but we include a check to be safe
        if (!foundOptionInventory || !foundOptionInventory.inventoryInfo) {
          throw new Error("inventory-info-not-found", `Inventory info not found for option with ID: ${option.variantId}`);
        }

        // if inventory info was found, add to option
        option.isSoldOut = foundOptionInventory.inventoryInfo.isSoldOut;
      });
    }
  });
}
