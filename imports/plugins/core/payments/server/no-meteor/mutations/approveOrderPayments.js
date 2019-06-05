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
 * @return {Promise<Object>} ApproveOrderPaymentsResult
 */
export default async function approveOrderPayments(context, input = {}) {
  inputSchema.validate(input);

  const { appEvents, collections, userId } = context;
  const { Orders } = collections;
  const { orderId, paymentIds, shopId } = input;

  if (!context.userHasPermission(["orders"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const order = await Orders.findOne({ _id: orderId, shopId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  if (paymentIds.length === 0) return { order };

  const { value: updatedOrder } = await Orders.findOneAndUpdate({
    _id: orderId,
    payments: {
      $elemMatch: {
        _id: { $in: paymentIds },
        status: { $in: ["adjustments", "created"] }
      }
    }
  }, {
    $set: {
      "payments.$.status": "approved"
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
