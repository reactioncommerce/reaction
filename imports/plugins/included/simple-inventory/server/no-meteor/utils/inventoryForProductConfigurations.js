import isEqual from "lodash/isEqual";

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
 * @returns {Promise<Object[]>} Array of responses, in same order as `input.productConfigurations` array.
 */
export default async function inventoryForProductConfigurations(context, input) {
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
