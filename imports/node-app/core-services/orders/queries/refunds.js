import ReactionError from "@reactioncommerce/reaction-error";
import { getOrderQuery } from "../util/getOrderQuery.js";

/**
 * @name refunds
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order, and returns refunds applied to payments associated with this order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderId - Order ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @returns {Promise<Array>|undefined} - An array of refunds applied to this order, if found
 */
export default async function refunds(context, { orderId, shopId, token } = {}) {
  if (!orderId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderId and shopId arguments");
  }

  const selector = getOrderQuery(context, { _id: orderId }, shopId, token);
  const order = await context.collections.Orders.findOne(selector);

  if (!order) {
    throw new ReactionError("not-found", "Order not found");
  }

  const paymentRefunds = [];

  if (Array.isArray(order.payments)) {
    const shopRefundsWithPaymentPromises = order.payments.map((payment) =>
      context.queries.getPaymentMethodConfigByName(payment.name)
        .functions.listRefunds(context, payment)
        .then((shopRefunds) => ({ shopRefunds, payment })));

    // this gives us an array of objects with properties
    // `shopRefunds` and the corresponding `payment`
    const shopRefundsWithPayments = await Promise.all(shopRefundsWithPaymentPromises);

    // loop over each refund and add `paymentId` and `paymentDisplayName`
    shopRefundsWithPayments.forEach(({ shopRefunds, payment }) => {
      const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({
        ...shopRefund,
        paymentId: payment._id,
        paymentDisplayName: payment.displayName
      }));
      paymentRefunds.push(...shopRefundsWithPaymentId);
    });
  }

  return paymentRefunds;
}
