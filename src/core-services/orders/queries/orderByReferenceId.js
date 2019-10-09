import ReactionError from "@reactioncommerce/reaction-error";
import { getOrderQuery } from "../util/getOrderQuery.js";

/**
 * @name orderByReferenceId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order with the provided order referenceId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderReferenceId - Order reference ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @returns {Promise<Object>|undefined} - An Order document, if one is found
 */
export default async function orderByReferenceId(context, { orderReferenceId, shopId, token } = {}) {
  if (!orderReferenceId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderReferenceId and shopId arguments");
  }
  const selector = getOrderQuery(context, { referenceId: orderReferenceId }, shopId, token);
  return context.collections.Orders.findOne(selector);
}
