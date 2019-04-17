import ReactionError from "@reactioncommerce/reaction-error";

const ALLOWED_FILTERS = [
  "isDeleted",
  "isVisible",
  "isLowQuantity",
  "isSoldOut",
  "isBackorder"
];

/**
 *
 * @method xformCatalogFilters
 * @summary Transforms JSON encoded filters for the Catalog collection into
 * Mongo expressions.
 * @param {Object[]} filters - Array of JSON encoded filters
 * @return {Object[]} Array Mongo filter expressions
 */
export default function xformCatalogFilters(filters) {
  const mongoFilters = {};
  for (let index = 0; index < filters.length; index += 1) {
    const { name: filterName, value } = filters[index];

    // if this filter is not allowed, skip.
    if (!ALLOWED_FILTERS.includes(filterName)) {
      continue;
    }

    let filterValue;
    try {
      filterValue = JSON.parse(value);
    } catch (error) {
      throw new ReactionError("invalid-catalog-filter-value", `The value for Catalog filter: ${filterName} could no be parsed`);
    }

    mongoFilters[`product.${filterName}`] = filterValue;
  }

  return mongoFilters;
}
