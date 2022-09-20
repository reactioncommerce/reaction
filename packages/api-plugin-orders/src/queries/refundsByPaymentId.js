import ReactionError from "@reactioncommerce/reaction-error";
import { getOrderQuery } from "../util/getOrderQuery.js";

/**
 * @name refundsByPaymentId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order, and returns refunds applied to a specific payment associated with this order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderId - Order ID
 * @param {String} params.paymentId - Payment ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @param {String} [providedOrder] - Order object
 * @returns {Promise<Array>|undefined} - An array of refunds applied to a specific payment from this order, if found
 */
export default async function refundsByPaymentId(context, { orderId, paymentId, shopId, token } = {}, providedOrder) {
  if (!orderId || !paymentId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderId, paymentId, and shopId arguments");
  }

  let order = providedOrder;
  if (!providedOrder) {
    order = await getOrderQuery(context, { _id: orderId }, shopId, token);
  }

  if (!order) {
    throw new ReactionError("not-found", "Order not found");
  }

  const paymentRefunds = [];

  const [payment] = order.payments.filter((filteredPayment) => filteredPayment._id === paymentId);

  if (!payment) {
    throw new ReactionError("not-found", "Payment not found");
  }

  const shopRefunds = await context.queries.getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment);
  const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({
    ...shopRefund,
    paymentId: payment._id,
    paymentDisplayName: payment.displayName
  }));
  paymentRefunds.push(...shopRefundsWithPaymentId);

  return paymentRefunds;
}
