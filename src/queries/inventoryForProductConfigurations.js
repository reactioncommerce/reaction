import validateInventoryInput from "../utils/validateInventoryInput.js";
import validateInventoryPluginResult from "../utils/validateInventoryPluginResults.js";

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
  for (const inventoryFn of context.getFunctionsOfType("inventoryForProductConfigurations")) {
    // eslint-disable-next-line no-await-in-loop
    const pluginResults = await inventoryFn(context, input);

    /**
     * Custom validation function is replacing what used to be a call to simpl-schema.
     * However, simpl-schema validate() method on moderately large payloads adds a pretty significant
     * performance penalty, each call on average taking 40ms.
     * Please don't replace with simpl-schema.
     */
    const validationErrors = validateInventoryPluginResult(pluginResults);
    if (validationErrors.length) {
      throw new Error(`Response from "inventoryForProductConfigurations" type function was invalid: ${validationErrors.join("\n")}`);
    }

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
    const { canSellVariantWithoutInventory } = await context.queries.appSettings(context, shopId);
    const inventoryInfo = canSellVariantWithoutInventory ? DEFAULT_SELLABLE_INFO : DEFAULT_SOLD_OUT_INFO;
    for (const productConfiguration of remainingProductConfigurations) {
      results.push({ inventoryInfo, productConfiguration });
    }
  }

  return results;
}

/**
 * @summary Returns an object with inventory information for one or more
 *   product configurations. For performance, it is better to call this
 *   function once rather than calling `inventoryForProductConfiguration`
 *   (singular) in a loop.
 * @param {Object} context App context
 * @param {Object} input Additional input arguments
 * @param {Object[]} input.productConfigurations An array of ProductConfiguration objects
 * @param {String[]} [input.fields] Optional array of fields you need. If you don't need all,
 *   you can pass this to skip some calculations and database lookups, improving speed.
 * @returns {Promise<Object[]>} Array of responses. Order is not guaranteed to be the same
 *   as `input.productConfigurations` array.
 */
export default async function inventoryForProductConfigurations(context, input) {
  const { collections } = context;
  const { Products } = collections;

  /**
   * Custom validation function is replacing what used to be a call to simpl-schema.
   * However, simpl-schema validate() method on moderately large payloads adds a pretty significant
   * performance penalty, each call on average taking 40ms.
   * Please don't replace with simpl-schema.
   */
  const validationErrors = validateInventoryInput(input);
  if (validationErrors.length) {
    throw new Error(`Input passed into "inventoryForProductConfigurations" was invalid: ${validationErrors.join("\n")}`);
  }

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
