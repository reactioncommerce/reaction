import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name ordersByAccountId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for orders made by the provided accountId and (optionally) shopIds
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.accountId - Account ID to search orders for
 * @param {String} params.orderStatus - Workflow status as a string, or an Array of strings to limit search results
 * @param {String} params.shopIds - Shop IDs for the shops that owns the orders
 * @returns {Promise<Object>|undefined} - An Array of Order documents, if found
 */
export default async function ordersByAccountId(context, { accountId, orderStatus, shopIds } = {}) {
  const { accountId: contextAccountId, collections, shopsUserHasPermissionFor, userHasPermission } = context;
  const { Orders } = collections;

  if (!accountId) {
    throw new ReactionError("invalid-param", "You must provide accountId arguments");
  }

  let query = {
    accountId
  };

  // If orderStatus array is provided, only return orders with statuses in Array
  // Otherwise, return all orders
  if (Array.isArray(orderStatus) && orderStatus.length > 0) {
    query = {
      "workflow.status": { $in: orderStatus },
      ...query
    };
  }

  if (shopIds) query.shopId = { $in: shopIds };

  if (accountId !== contextAccountId) {
    // If an admin wants all orders for an account, we force it to be limited to the
    // shops for which they're allowed to see orders.
    if (!shopIds) {
      const shopIdsUserHasPermissionFor = shopsUserHasPermissionFor("orders");
      query.shopId = { $in: shopIdsUserHasPermissionFor };
    } else {
      shopIds.forEach((shopId) => {
        if (!userHasPermission(["orders", "order/fulfillment"], shopId)) {
          throw new ReactionError("access-denied", "Access Denied");
        }
      });
    }
  }

  return Orders.find(query);
}
