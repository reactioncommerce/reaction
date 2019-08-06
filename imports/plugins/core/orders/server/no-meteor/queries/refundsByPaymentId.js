import ReactionError from "@reactioncommerce/reaction-error";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import { getOrderQuery } from "../util/getOrderQuery";

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
 * @return {Promise<Array>|undefined} - An array of refunds applied to a specific payment from this order, if found
 */
export default async function refundsByPaymentId(context, { order: providedOrder, orderId, paymentId, shopId, token } = {}) {
  if (!paymentId || !shopId || (!providedOrder && !orderId)) {
    throw new ReactionError("invalid-param", "You must provide paymentId, shopId, and either order or orderId arguments");
  }

  let order = providedOrder;
  if (!providedOrder) {
    const selector = getOrderQuery(context, { _id: orderId }, shopId, token);
    order = await context.collections.Orders.findOne(selector);
  }

  if (!order) {
    throw new ReactionError("not-found", "Order not found");
  }

  const paymentRefunds = [];

  const [payment] = order.payments.filter((filteredPayment) => filteredPayment._id === paymentId);

  if (!payment) {
    throw new ReactionError("not-found", "Payment not found");
  }

  const shopRefunds = await getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment);
  const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({
    ...shopRefund,
    paymentId: payment._id,
    paymentDisplayName: payment.displayName
  }));
  paymentRefunds.push(...shopRefundsWithPaymentId);

  return paymentRefunds;
}
