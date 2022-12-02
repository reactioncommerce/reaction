import generateFilterQuery from "@reactioncommerce/api-utils/lib/generateFilterQuery.js";

/**
 * @name filterSearchOrders
 * @method
 * @memberof GraphQL/Orders
 * @summary Query the Orders collection for a list of orders
 * @param {Object} context - an object containing the per-request state
 * @param {Object} filter1level - an object containing ONE level of filters to apply
 * @param {Object} filter2level - an object containing TWO levels of filters to apply
 * @param {Object} filter3level - an object containing THREE levels of filters to apply
 * @param {String} level - number of levels used in filter object
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Orders object Promise
 */
export default async function filterSearchOrders(context, filter1level, filter2level, filter3level, level, shopId) {
  const { collections: { Orders } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }

  await context.validatePermissions("reaction:legacy:orders", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Order", filter1level, filter2level, filter3level, level, shopId);

  return Orders.find(filterQuery);
}
