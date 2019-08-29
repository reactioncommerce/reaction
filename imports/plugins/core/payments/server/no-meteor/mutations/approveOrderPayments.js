import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  orderId: String,
  paymentIds: [String],
  shopId: String
});

/**
 * @method approveOrderPayments
 * @summary Attempt to approve one or more authorized payments for an order
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - ApproveOrderPaymentsInput
 * @param {String} input.orderId - The order ID
 * @param {String[]} input.paymentIds - An array of one or more payment IDs to approve
 * @param {String} input.shopId - The ID of the shop that owns this order
 * @returns {Promise<Object>} ApproveOrderPaymentsResult
 */
export default async function approveOrderPayments(context, input = {}) {
  inputSchema.validate(input);

  const { appEvents, collections, userId } = context;
  const { Orders } = collections;
  const { orderId, paymentIds, shopId } = input;

  if (!context.userHasPermission(["orders", "order/fulfillment"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const order = await Orders.findOne({ _id: orderId, shopId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  if (paymentIds.length === 0) return { order };

  const updatedPayments = order.payments;
  const paymentStatusesAllowedToBeApproved = ["adjustments", "created"];

  // Set payment.status to approved for all paymentIds provided
  paymentIds.forEach((paymentId) => {
    const payment = updatedPayments.find((pmt) => pmt._id === paymentId);
    if (payment && paymentStatusesAllowedToBeApproved.includes(payment.status)) {
      payment.status = "approved";
    }
  });

  // Update Order with new payment status
  const { value: updatedOrder } = await Orders.findOneAndUpdate({
    _id: orderId
  }, {
    $set: {
      payments: updatedPayments
    }
  }, { returnOriginal: false });

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  appEvents.emit("afterOrderApprovePayment", {
    approvedBy: userId,
    order: updatedOrder
  });

  return { order: updatedOrder };
}
