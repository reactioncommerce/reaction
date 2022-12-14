import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

/**
 * @name filterProducts
 * @method
 * @memberof GraphQL/Products
 * @summary Query the Products collection for a list of products
 * @param {Object} context - an object containing the per-request state
 * @param {Object} conditions - object containing the filter conditions
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Products object Promise
 */
export default async function filterProducts(context, conditions, shopId) {
  const { collections: { Products } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }

  await context.validatePermissions("reaction:legacy:products", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Product", conditions, shopId);

  return Products.find(filterQuery);
}
