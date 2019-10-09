import ReactionError from "@reactioncommerce/reaction-error";
import { getOrderQuery } from "../util/getOrderQuery.js";

/**
 * @name orderById
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order with the provided orderId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderId - Order ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @returns {Promise<Object>|undefined} - An Order document, if one is found
 */
export default async function orderById(context, { orderId, shopId, token } = {}) {
  if (!orderId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderId and shopId arguments");
  }

  const selector = getOrderQuery(context, { _id: orderId }, shopId, token);
  return context.collections.Orders.findOne(selector);
}
