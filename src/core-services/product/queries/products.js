import applyProductFilters from "../utils/applyProductFilters.js";

/**
 * @name products
 * @method
 * @memberof GraphQL/Products
 * @summary Query the Products collection
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - ID of Shop to query against
 * @returns {Promise<Object>} Products object Promise
 */
export default async function products(context, input) {
  const { checkPermissions, collections } = context;
  const { Products } = collections;
  const { ...productFilters } = input;

  // Check the permissions for all shop requested
  await Promise.all(productFilters.shopIds.map(async (shopId) => (
    checkPermissions(["owner", "admin", "createProduct"], shopId)
  )));

  // Create the mongo selector from the filters
  const selector = applyProductFilters(context, productFilters);

  // Get the first N (limit) top-level products that match the query
  return Products.find(selector);
}
