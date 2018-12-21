import { check } from "meteor/check";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";
import sendOrderEmail from "../util/sendOrderEmail";

/**
 * @name orders/refunds/create
 * @method
 * @memberof Orders/Methods
 * @summary Apply a refund to an already captured order
 * @param {String} orderId - order object
 * @param {String} paymentId - ID of payment to refund
 * @param {Number} amount - Amount of the refund, as a positive number
 * @return {null} no return value
 */
export default function createRefund(orderId, paymentId, amount) {
  check(orderId, String);
  check(paymentId, String);
  check(amount, Number);

  const order = Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  const authUserId = Reaction.getUserId();

  if (!Reaction.hasPermission("orders", authUserId, order.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const payment = (order.payments || []).find((pmt) => pmt._id === paymentId);
  if (!payment) throw new ReactionError("not-found", "Payment not found");

  const { name } = payment;
  const context = Promise.await(getGraphQLContextInMeteorMethod(authUserId));
  const result = Promise.await(getPaymentMethodConfigByName(name).functions.createRefund(context, payment, amount));

  if (!result.saved) {
    Logger.fatal("Attempt to refund payment failed", order._id, paymentId, result.error);
    throw new ReactionError("Attempt to refund payment failed", result.error);
  }

  Orders.update(
    {
      "_id": orderId,
      "payments._id": paymentId
    },
    {
      $set: {
        "payments.$.mode": "cancel",
        "payments.$.status": "refunded"
      },
      $push: {
        "payments.$.transactions": result
      }
    }
  );

  Hooks.Events.run("onOrderRefundCreated", orderId);

  // Send email to notify customer of a refund
  sendOrderEmail(order, "refunded");
}
