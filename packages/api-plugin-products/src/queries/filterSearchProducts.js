import generateFilterQuery from "@reactioncommerce/api-utils/lib/generateFilterQuery.js";

/**
 * @name filterSearchProducts
 * @method
 * @memberof GraphQL/Products
 * @summary Query the Products collection for a list of products
 * @param {Object} context - an object containing the per-request state
 * @param {Object} filter1level - an object containing ONE level of filters to apply
 * @param {Object} filter2level - an object containing TWO levels of filters to apply
 * @param {Object} filter3level - an object containing THREE levels of filters to apply
 * @param {String} level - number of levels used in filter object
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Products object Promise
 */
export default async function filterSearchProducts(context, filter1level, filter2level, filter3level, level, shopId) {
  const { collections: { Products } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }

  await context.validatePermissions("reaction:legacy:products", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Product", filter1level, filter2level, filter3level, level, shopId);

  return Products.find(filterQuery);
}
