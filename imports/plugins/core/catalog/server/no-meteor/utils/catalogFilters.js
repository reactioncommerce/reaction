/**
 *
 * @method xformCatalogFilters
 * @summary Transforms a boolean filters array into a filters object.
 * @param {Object[]} filters - Array of JSON encoded filters
 * @return {Object[]} Array Mongo filter expressions
 */
export default function xformCatalogFilters(filters) {
  const mongoFilters = {};
  for (let index = 0; index < filters.length; index += 1) {
    const { name, value } = filters[index];

    mongoFilters[`product.${name}`] = value;
  }

  return mongoFilters;
}
