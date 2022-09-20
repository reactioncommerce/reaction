const INVENTORY_PLUGIN_BOOLEAN_FILTERS = ["isBackorder", "isLowQuantity", "isSoldOut"];

/**
 *
 * @method xformCatalogBooleanFilters
 * @memberof Inventory
 * @summary Transforms a boolean filters array into an array of Mongo expressions.
 * @param {Object} context - contains per-request state
 * @param {Object[]} booleanFilters - Array of Boolean filters
 * @returns {Object[]} Array Mongo filter expressions
 */
export default async function xformCatalogBooleanFilters(context, booleanFilters) {
  const mongoFilters = [];

  // Add inventory plugin's filters, if any
  for (const filter of booleanFilters) {
    if (INVENTORY_PLUGIN_BOOLEAN_FILTERS.includes(filter.name)) {
      let { value } = filter;
      // Ensure that documents where the filter field is
      // not set are also returned.
      if (value === false) value = { $ne: true };

      mongoFilters.push({ [`product.${filter.name}`]: value });
    }
  }

  return mongoFilters;
}

