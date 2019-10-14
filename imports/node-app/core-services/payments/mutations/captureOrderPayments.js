import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  orderId: String,
  paymentIds: [String],
  shopId: String
});

/**
 * @method captureOrderPayments
 * @summary Attempt to capture one or more authorized payments for an order
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} input - CaptureOrderPaymentsInput
 * @param {String} input.orderId - The order ID
 * @param {String[]} input.paymentIds - An array of one or more payment IDs to capture
 * @param {String} input.shopId - The ID of the shop that owns this order
 * @returns {Promise<Object>} CaptureOrderPaymentsResult
 */
export default async function captureOrderPayments(context, input = {}) {
  inputSchema.validate(input);
  const { appEvents, collections, userId } = context;
  const { Orders } = collections;
  const { orderId, paymentIds, shopId } = input;

  if (!context.userHasPermission(["orders", "order/fulfillment"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const order = await Orders.findOne({ _id: orderId, shopId });
  if (!order) throw new ReactionError("not-found", "Order not found");

  // If order status is still "new", bump to "processing"
  if (order.workflow.status === "new") {
    await Orders.updateOne({ _id: orderId }, {
      $set: {
        "workflow.status": "coreOrderWorkflow/processing"
      },
      $addToSet: {
        "workflow.workflow": "coreOrderWorkflow/processing"
      }
    });
  }

  const orderPaymentsToCapture = (order.payments || []).filter((payment) =>
    paymentIds.includes(payment._id) && payment.mode === "authorize" && ["approved", "error"].includes(payment.status));

  if (orderPaymentsToCapture.length === 0) return { order };

  // TODO capture a specific amount, maybe partial, if only some groups are fulfilled

  const capturePromises = orderPaymentsToCapture.map(async (payment) => {
    let result = { saved: false };
    try {
      result = await context.queries.getPaymentMethodConfigByName(payment.name).functions.capturePayment(context, payment);
    } catch (error) {
      result.error = error;
      result.errorCode = "uncaught_plugin_error";
      result.errorMessage = error.message;
    }
    result.paymentId = payment._id;
    return result;
  });

  const captureResults = await Promise.all(capturePromises);

  const updatedPayments = order.payments;
  const capturedPayments = [];
  captureResults.forEach((captureResult) => {
    const payment = updatedPayments.find((pmt) => pmt._id === captureResult.paymentId);

    if (captureResult.saved || captureResult.isAlreadyCaptured) {
      payment.mode = "captured";
      payment.status = "completed";
      payment.metadata = { ...(payment.metadata || {}), ...(captureResult.metadata || {}) };
      capturedPayments.push(payment);
    } else {
      payment.status = "error";
      payment.captureErrorCode = captureResult.errorCode;
      payment.captureErrorMessage = captureResult.errorMessage;
    }

    payment.transactions.push(captureResult);
  });

  const { value: updatedOrder } = await Orders.findOneAndUpdate({ _id: orderId }, {
    $set: {
      payments: updatedPayments,
      updatedAt: new Date()
    }
  }, { returnOriginal: false });

  await appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: userId
  });

  capturedPayments.forEach((payment) => {
    appEvents.emit("afterOrderPaymentCapture", {
      capturedBy: userId,
      order: updatedOrder,
      payment
    });
  });

  return { order: updatedOrder };
}
