import { xformOrderPayment } from "@reactioncommerce/reaction-graphql-xforms/order";

/**
 * @name Order/payments
 * @method
 * @memberof Order/GraphQL
 * @summary Returns payments applied to an order
 * @param {Object} context - an object containing the per-request state
 * @param {Object} order order object refunds would be applied to
 * @returns {Promise<Object[]>} Promise that resolves with array of payment objects
 */
export default async function payments(context, order) {
  if (Array.isArray(order.payments)) {
    return order.payments.map(async (payment) => {
      const xformPayment = xformOrderPayment(payment);

      const refunds = await context.queries.refundsByPaymentId(context, {
        orderId: order._id,
        paymentId: payment._id,
        shopId: order.shopId,
        token: order.token || null
      }, order);


      if (Array.isArray(refunds)) {
        xformPayment.refunds = refunds;
      }

      return xformPayment;
    });
  }

  return null;
}
