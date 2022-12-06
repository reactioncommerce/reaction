import generateFilterQuery from "@reactioncommerce/api-utils/lib/generateFilterQuery.js";

/**
 * @name filterSearchOrders
 * @method
 * @memberof GraphQL/Orders
 * @summary Query the Orders collection for a list of orders
 * @param {Object} context - an object containing the per-request state
 * @param {Object} conditions - object containing the filter conditions
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Orders object Promise
 */
export default async function filterSearchOrders(context, conditions, shopId) {
  const { collections: { Orders } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }

  await context.validatePermissions("reaction:legacy:orders", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Order", conditions, shopId);

  return Orders.find(filterQuery);
}
