import _ from "lodash";
import xformArrayToConnection from "@reactioncommerce/api-utils/graphql/xformArrayToConnection.js";
import xformOrderItems from "../../xforms/xformOrderItems.js";

/**
 * @summary Sorts the provided order items according to the connectionArgs.
 * @param {Object[]} orderItems Array of order items
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @returns {Object[]} Sorted list of order items
 */
function sortOrderItems(orderItems, connectionArgs) {
  const { sortOrder, sortBy } = connectionArgs;

  let sortedItems;
  switch (sortBy) {
    case "addedAt":
      sortedItems = _.orderBy(orderItems, ["addedAt", "_id"], [sortOrder, sortOrder]);
      break;

    // sort alpha by _id
    default:
      sortedItems = _.orderBy(orderItems, ["_id"], [sortOrder]);
      break;
  }

  return sortedItems;
}

/**
 * @name OrderFulfillmentGroup/items
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `items` prop on the provided order fulfillment group to a connection
 * @param {Object} fulfillmentGroup - result of the parent resolver, which is an OrderFulfillmentGroup object in GraphQL schema format
 * @param {ConnectionArgs} connectionArgs - An object of all arguments that were sent by the client
 * @param {Object} context - The per-request context object
 * @returns {Promise<Object>} A connection object
 */
export default async function items(fulfillmentGroup, connectionArgs, context) {
  let { items: orderItems } = fulfillmentGroup;
  if (!Array.isArray(orderItems) || orderItems.length === 0) return xformArrayToConnection(connectionArgs, []);

  // Apply requested sorting
  orderItems = sortOrderItems(orderItems, connectionArgs);

  return xformArrayToConnection(connectionArgs, xformOrderItems(context, orderItems));
}
