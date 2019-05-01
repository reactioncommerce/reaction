const ALL_FIELDS = [
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

const DEFAULT_INFO = {
  inventoryAvailableToSell: 0,
  inventoryInStock: 0,
  inventoryReserved: 0,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false
};

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
 * @param {Object[]} [input.variants] Optionally pass an array of the relevant variants if
 *   you have already looked them up. This will save a database query.
 * @return {Promise<Object[]>} Array of responses. Order is not guaranteed to be the same
 *   as `input.productConfigurations` array.
 */
export default async function inventoryForProductConfigurations(context, input) {
  const { getFunctionsOfType } = context;
  const { fields = ALL_FIELDS } = input;
  let { productConfigurations } = input;

  // If there are multiple plugins providing inventory, we use the first one that has a response
  // for each product configuration.
  const results = [];
  for (const inventoryFn of getFunctionsOfType("inventoryForProductConfigurations")) {
    // Functions of type "publishProductToCatalog" are expected to mutate the provided catalogProduct.
    // eslint-disable-next-line no-await-in-loop
    const pluginResults = await inventoryFn(context, { ...input, fields, productConfigurations });

    // Add only those with inventory info to final results.
    // Otherwise add to productConfigurations for next run
    productConfigurations = [];
    for (const pluginResult of pluginResults) {
      if (pluginResult.inventoryInfo) {
        results.push(pluginResult);
      } else {
        productConfigurations.push(pluginResult.productConfiguration);
      }
    }

    if (productConfigurations.length === 0) break; // found inventory info for every product config
  }

  // If no inventory info was found for some of the product configs, such as
  // if there are no plugins providing inventory info, then use default info
  // that allows the product to be purchased always.
  for (const productConfiguration of productConfigurations) {
    results.push({
      productConfiguration,
      inventoryInfo: DEFAULT_INFO
    });
  }

  return results;
}
