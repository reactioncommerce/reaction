import addOrderEmail from "./addOrderEmail";
import approvePayment from "./approvePayment";
import cancelOrder from "./cancelOrder";
import capturePayments from "./capturePayments";
import coreOrderCompletedWorkflow from "./coreOrderCompletedWorkflow";
import coreOrderProcessingWorkflow from "./coreOrderProcessingWorkflow";
import createRefund from "./createRefund";
import listRefunds from "./listRefunds";
import makeAdjustmentsToInvoice from "./makeAdjustmentsToInvoice";
import processPayment from "./processPayment";
import refundItems from "./refundItems";
import sendNotification from "./sendNotification";
import shipmentDelivered from "./shipmentDelivered";
import shipmentLabeled from "./shipmentLabeled";
import shipmentPacked from "./shipmentPacked";
import shipmentPicked from "./shipmentPicked";
import shipmentShipped from "./shipmentShipped";
import updateHistory from "./updateHistory";
import updateShipmentTracking from "./updateShipmentTracking";

/**
 * @file Methods for Orders.
 *
 *
 * @namespace Orders/Methods
 */

export default {
  "orders/addOrderEmail": addOrderEmail,
  "orders/approvePayment": approvePayment,
  "orders/cancelOrder": cancelOrder,
  "orders/capturePayments": capturePayments,
  "orders/makeAdjustmentsToInvoice": makeAdjustmentsToInvoice,
  "orders/processPayment": processPayment,
  "orders/refunds/create": createRefund,
  "orders/refunds/list": listRefunds,
  "orders/refunds/refundItems": refundItems,
  "orders/sendNotification": sendNotification,
  "orders/shipmentDelivered": shipmentDelivered,
  "orders/shipmentLabeled": shipmentLabeled,
  "orders/shipmentPacked": shipmentPacked,
  "orders/shipmentPicked": shipmentPicked,
  "orders/shipmentShipped": shipmentShipped,
  "orders/updateHistory": updateHistory,
  "orders/updateShipmentTracking": updateShipmentTracking,
  "workflow/coreOrderWorkflow/coreOrderProcessing": coreOrderProcessingWorkflow,
  "workflow/coreOrderWorkflow/coreOrderCompleted": coreOrderCompletedWorkflow
};
