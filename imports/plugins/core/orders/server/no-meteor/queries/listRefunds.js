import ReactionError from "@reactioncommerce/reaction-error";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import { getOrderQuery } from "../util/getOrderQuery";

/**
 * @name listRefunds
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order, and returns refunds applied to payments associated with this order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderId - Order ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @return {Promise<Array>|undefined} - An array of refunds applied to this order, if found
 */
export default async function listRefunds(context, { orderId, shopId, token } = {}) {
  if (!orderId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderId and shopId arguments");
  }
  const selector = getOrderQuery(context, { _id: orderId }, shopId, token);
  const order = await context.collections.Orders.findOne(selector);
  const refunds = [];

  if (Array.isArray(order.payments)) {
    for (const payment of order.payments) {
      /* eslint-disable no-await-in-loop */
      const shopRefunds = await getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment);
      /* eslint-enable no-await-in-loop */
      const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({ ...shopRefund, paymentId: payment._id }));
      refunds.push(...shopRefundsWithPaymentId);
    }
  }

  return refunds;
}
