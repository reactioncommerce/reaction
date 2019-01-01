import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";

/**
 * @name orders/refund/list
 * @summary loop through order's payments and find existing refunds.
 * Get a list of refunds for a particular payment method.
 * @method
 * @memberof Orders/Methods
 * @param {Object} order - order object
 * @return {Array} Array contains refund records
 */
export default function listRefunds(order) {
  check(order, Object);

  if (this.userId !== order.userId && !Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const dbOrder = Orders.findOne({ _id: order._id });

  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));

  const refunds = [];

  if (Array.isArray(dbOrder.payments)) {
    for (const payment of dbOrder.payments) {
      const shopRefunds = Promise.await(getPaymentMethodConfigByName(payment.name).functions.listRefunds(context, payment));
      const shopRefundsWithPaymentId = shopRefunds.map((shopRefund) => ({ ...shopRefund, paymentId: payment._id }));
      refunds.push(...shopRefundsWithPaymentId);
    }
  }

  return refunds;
}
