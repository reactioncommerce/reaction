import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name ordersByAccountId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for orders made by the provided accountId and (optionally) shopIds
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.accountId - Account ID to search orders for
 * @param {String} params.orderStatus - Workflow status to limit search results
 * @param {String} params.shopIds - Shop IDs for the shops that owns the orders
 * @returns {Promise<Object>|undefined} - An Array of Order documents, if found
 */
export default async function ordersByAccountId(context, { accountId, orderStatus, shopIds } = {}) {
  const { collections } = context;
  const { Orders } = collections;

  if (!accountId) throw new ReactionError("invalid-param", "You must provide accountId arguments");

  // Validate user has permission to view orders for all shopIds
  if (!shopIds) throw new ReactionError("invalid-param", "You must provide ShopId(s)");
  for (const shopId of shopIds) {
    await context.validatePermissions("reaction:legacy:orders", "read", { shopId, owner: accountId }); // eslint-disable-line no-await-in-loop
  }

  let query = {
    accountId,
    shopId: { $in: shopIds }
  };

  // If orderStatus array is provided, only return orders with statuses in Array
  // Otherwise, return all orders
  if (Array.isArray(orderStatus) && orderStatus.length > 0) {
    query = {
      "workflow.status": { $in: orderStatus },
      ...query
    };
  }

  return Orders.find(query);
}
