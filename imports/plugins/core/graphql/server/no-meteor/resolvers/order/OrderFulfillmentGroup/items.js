import { xformArrayToConnection } from "@reactioncommerce/reaction-graphql-xforms/connection";
import { xformOrderItems } from "@reactioncommerce/reaction-graphql-xforms/order";

/**
 * @name "Order.items"
 * @method
 * @memberof Order/GraphQL
 * @summary converts the `items` prop on the provided order fulfillment group to a connection
 * @param {Object} fulfillmentGroup - result of the parent resolver, which is an OrderFulfillmentGroup object in GraphQL schema format
 * @return {Promise<Object>} A connection object
 */
export default async function items(fulfillmentGroup, connectionArgs, context) {
  if (!Array.isArray(fulfillmentGroup.items)) return [];

  return xformArrayToConnection(connectionArgs, xformOrderItems(context, fulfillmentGroup.items));
}
