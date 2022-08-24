import SimpleSchema from "simpl-schema";
import accounting from "accounting-js";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import sendOrderEmail from "../util/sendOrderEmail.js";

const inputSchema = new SimpleSchema({
  amount: {
    type: Number,
    exclusiveMin: true,
    min: 0
  },
  orderId: String,
  paymentId: String,
  reason: {
    type: String,
    optional: true
  }
});

/**
 * @method createRefund
 * @summary Use this mutation to create a refund on an order payment
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @param {Object} input.amount - amount to refund
 * @param {Object} input.orderId - order ID of order where payment was applied
 * @param {Object} input.paymentId - ID of payment to refund
 * @param {Object} input.reason - reason for refund
 * @returns {Promise<Object>} Object with `order` property containing the updated order
 */
export default async function createRefund(context, input) {
  inputSchema.validate(input);

  const {
    amount,
    orderId,
    paymentId,
    reason
  } = input;

  const { appEvents, collections, userId } = context;
  const { Orders } = collections;

  // First verify that this order actually exists
  const order = await Orders.findOne({ _id: orderId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // Allow refund for accounts with orders or "order/fulfillment" permissions
  await context.validatePermissions(
    `reaction:legacy:orders:${order._id}`,
    "refund:payment",
    { shopId: order.shopId }
  );

  // Verify payment exists
  const payment = (order.payments || []).find((pmt) => pmt._id === paymentId);
  if (!payment) throw new ReactionError("not-found", "Payment not found");

  // Verify that payment method will accept refunds
  const { name } = payment;
  const { canRefund, functions } = context.queries.getPaymentMethodConfigByName(name);
  if (!canRefund) throw new ReactionError("invalid", "Refunding not supported");

  // Find total of any previous refunds, and determine how much balance is left
  // on this payment that can be refunded.
  const previousRefunds = await functions.listRefunds(context, payment);
  const previousRefundsTotal = previousRefunds.reduce((sum, refund) => sum + refund.amount, 0);
  const amountNotYetRefunded = payment.amount - previousRefundsTotal;

  // Refund the lower amount between `amountNotYetRefunded`, and the `amount` that was passed
  const amountToRefund = Math.min(amountNotYetRefunded, amount);
  const result = await functions.createRefund(context, payment, amountToRefund, reason);

  if (!result.saved) {
    Logger.fatal("Attempt to refund payment failed", order._id, paymentId, result.error);
    throw new ReactionError("Attempt to refund payment failed", result.error);
  }

  // List refunds to see if we've now refunded the full amount of this payment
  const allRefunds = await functions.listRefunds(context, payment);
  const newRefundsTotal = allRefunds.reduce((sum, refund) => sum + refund.amount, 0);

  // There could be JS math errors so we round to 3 decimal places when comparing
  const isFullyRefunded = accounting.toFixed(newRefundsTotal, 3) === accounting.toFixed(payment.amount, 3);


  const { modifiedCount, value: updatedOrder } = await Orders.findOneAndUpdate(
    {
      "_id": orderId,
      "payments._id": paymentId
    },
    {
      $set: {
        "payments.$.status": isFullyRefunded ? "refunded" : "partialRefund"
      },
      $push: {
        "payments.$.transactions": result
      }
    }
  );

  if (modifiedCount === 0 || !updatedOrder) throw new ReactionError("server-error", "Unable to update order");

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  // Send email to notify customer of a refund
  sendOrderEmail(context, updatedOrder, "refunded");

  return { order: updatedOrder };
}
