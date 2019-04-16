import ReactionError from "@reactioncommerce/reaction-error";

const ALLOWED_FILTERS = [
  "isDeleted",
  "isVisible",
  "isLowQuantity",
  "isSoldOut",
  "isBackorder",
  "inventoryInStock",
  "inventoryAvailableToSell"
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

    // In the Catalog collection, each variant's available inventory,
    // is the  sum of the available options inventory. There applying the filter to the
    // variant will yield the desired effect.
    if (filterName === "inventoryInStock" || filterName === "inventoryAvailableToSell") {
      mongoFilters["product.variants"] = { $elemMatch: { [filterName]: filterValue } };
      continue;
    }

    mongoFilters[`product.${filterName}`] = filterValue;
  }

  return mongoFilters;
}
