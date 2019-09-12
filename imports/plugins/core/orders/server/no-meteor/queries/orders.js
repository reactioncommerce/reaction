import escapeRegExp from "lodash/escapeRegExp";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for orders and (optionally) shopIds
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.accountId - Account ID to search orders for
 * @param {String} params.orderStatus - Workflow status to limit search results
 * @param {String} params.shopIds - Shop IDs for the shops that owns the orders
 * @returns {Promise<Object>|undefined} - An Array of Order documents, if found
 */
export default async function orders(context, { filter, orderStatus, shopIds } = {}) {
  const { collections, shopsUserHasPermissionFor, userHasPermission } = context;
  const { Orders } = collections;

  let query = {};

  // If an admin wants all orders for an account, we force it to be limited to the
  // shops for which they're allowed to see orders.
  if (shopIds) {
    shopIds.forEach((shopId) => {
      if (!userHasPermission(["orders", "order/fulfillment"], shopId)) {
        throw new ReactionError("access-denied", "Access Denied");
      }
    });

    query.shopId = { $in: shopIds };
  } else {
    const shopIdsUserHasPermissionFor = shopsUserHasPermissionFor("orders");
    query.shopId = { $in: shopIdsUserHasPermissionFor };
  }

  // Use `filter` to filter out results on the server
  if (filter) {
    const regexMatch = { $regex: escapeRegExp(filter), $options: "i" };
    query = {
      $or: [
        // Exact matches
        { _id: filter }, // exact match the order id
        { referenceId: filter }, // exact match the reference id
        { email: filter }, // exact match the email

        // Regex match names as they include the whole name in one field
        { "payments.address.fullName": regexMatch },
        { "shipping.address.fullName": regexMatch }
      ]
    };
  }

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
