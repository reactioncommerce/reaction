/**
 * @summary Returns an object with inventory information for a single
 *   product configuration. Convenience wrapper for `inventoryForProductConfigurations`.
 *   For performance, it is better to call `inventoryForProductConfigurations` once
 *   rather than calling this function in a loop.
 * @param {Object} context App context
 * @param {Object} input Additional input arguments
 * @param {Object} input.productConfiguration A ProductConfiguration object
 * @param {String[]} [input.fields] Optional array of fields you need. If you don't need all,
 *   you can pass this to skip some calculations and database lookups, improving speed.
 * @return {Promise<Object>} InventoryInfo
 */
export default async function inventoryForProductConfiguration(context, input) {
  const { fields, productConfiguration } = input;

  const result = await context.queries.inventoryForProductConfigurations(context, {
    fields,
    productConfigurations: [productConfiguration]
  });

  return result[0].inventoryInfo;
}
