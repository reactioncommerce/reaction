import SimpleSchema from "simpl-schema";

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

const productConfigurationSchema = new SimpleSchema({
  isSellable: Boolean,
  productId: String,
  variantId: String
});

const inputSchema = new SimpleSchema({
  "fields": {
    type: Array,
    optional: true
  },
  "fields.$": {
    type: String,
    allowedValues: ALL_FIELDS
  },
  "productConfigurations": Array,
  "productConfigurations.$": productConfigurationSchema,
  "variants": {
    type: Array,
    optional: true
  },
  "variants.$": {
    type: Object,
    blackbox: true
  }
});

const inventoryInfoSchema = new SimpleSchema({
  inventoryAvailableToSell: {
    type: SimpleSchema.Integer,
    min: 0
  },
  inventoryInStock: {
    type: SimpleSchema.Integer,
    min: 0
  },
  inventoryReserved: {
    type: SimpleSchema.Integer,
    min: 0
  },
  isBackorder: Boolean,
  isLowQuantity: Boolean,
  isSoldOut: Boolean
});

const pluginResultSchema = new SimpleSchema({
  inventoryInfo: {
    type: inventoryInfoSchema,
    optional: true
  },
  productConfigurations: productConfigurationSchema
});

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
  const { collections, getFunctionsOfType } = context;
  const { Products } = collections;

  inputSchema.validate(input);

  const { fields = ALL_FIELDS, productConfigurations } = input;
  let { variants } = input;

  // Inventory plugins are expected to provide inventory info only for sellable variants.
  // If there are any non-sellable parent variants in the list, we remove them now.
  // We'll aggregate their child option values after we get them.
  let sellableProductConfigurations = [];
  const parentVariantProductConfigurations = [];
  for (const productConfiguration of productConfigurations) {
    if (productConfiguration.isSellable) {
      sellableProductConfigurations.push(productConfiguration);
    } else {
      parentVariantProductConfigurations.push(productConfiguration);
    }
  }

  // If there are multiple plugins providing inventory, we use the first one that has a response
  // for each product configuration.
  const results = [];
  for (const inventoryFn of getFunctionsOfType("inventoryForProductConfigurations")) {
    // Functions of type "publishProductToCatalog" are expected to mutate the provided catalogProduct.
    // eslint-disable-next-line no-await-in-loop
    const pluginResults = await inventoryFn(context, { ...input, fields, productConfigurations });

    pluginResultSchema.validate(pluginResults);

    // Add only those with inventory info to final results.
    // Otherwise add to sellableProductConfigurations for next run
    sellableProductConfigurations = [];
    for (const pluginResult of pluginResults) {
      if (pluginResult.inventoryInfo) {
        results.push(pluginResult);
      } else {
        sellableProductConfigurations.push(pluginResult.productConfiguration);
      }
    }

    if (sellableProductConfigurations.length === 0) break; // found inventory info for every product config
  }

  // If no inventory info was found for some of the product configs, such as
  // if there are no plugins providing inventory info, then use default info
  // that allows the product to be purchased always.
  for (const productConfiguration of sellableProductConfigurations) {
    results.push({
      productConfiguration,
      inventoryInfo: DEFAULT_INFO
    });
  }

  // Now it's time to calculate top-level variant aggregated inventory and add those to the results
  if (!variants) {
    const variantIds = parentVariantProductConfigurations.map(({ variantId }) => variantId);
    variants = await Products.find({ ancestors: { $in: variantIds } }).toArray();
  }

  for (const productConfiguration of parentVariantProductConfigurations) {
    const childOptions = variants.filter((option) => option.ancestors.includes(productConfiguration.variantId));
    const childOptionsInventory = childOptions.reduce((list, option) => {
      const optionResult = results.find((result) => result.productConfiguration.variantId === option._id);
      if (optionResult) list.push(optionResult.inventoryInfo);
      return list;
    }, []);
    results.push({
      productConfiguration,
      inventoryInfo: {
        inventoryAvailableToSell: childOptionsInventory.reduce((sum, option) => sum + option.inventoryAvailableToSell, 0),
        inventoryInStock: childOptionsInventory.reduce((sum, option) => sum + option.inventoryInStock, 0),
        inventoryReserved: childOptionsInventory.reduce((sum, option) => sum + option.inventoryReserved, 0),
        isBackorder: childOptionsInventory.every((option) => option.isBackorder),
        isLowQuantity: childOptionsInventory.some((option) => option.isLowQuantity),
        isSoldOut: childOptionsInventory.every((option) => option.isSoldOut)
      }
    });
  }

  return results;
}
