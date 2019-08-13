import approvePayment from "./approvePayment";
import createRefund from "./createRefund";
import makeAdjustmentsToInvoice from "./makeAdjustmentsToInvoice";
import refundItems from "./refundItems";
import sendNotification from "./sendNotification";
import shipmentDelivered from "./shipmentDelivered";
import shipmentLabeled from "./shipmentLabeled";
import shipmentPacked from "./shipmentPacked";
import shipmentPicked from "./shipmentPicked";
import shipmentShipped from "./shipmentShipped";
import updateHistory from "./updateHistory";

/**
 * @file Methods for Orders.
 *
 *
 * @namespace Orders/Methods
 */

export default {
  "orders/approvePayment": approvePayment,
  "orders/makeAdjustmentsToInvoice": makeAdjustmentsToInvoice,
  "orders/refunds/create": createRefund,
  "orders/refunds/refundItems": refundItems,
  "orders/sendNotification": sendNotification,
  "orders/shipmentDelivered": shipmentDelivered,
  "orders/shipmentLabeled": shipmentLabeled,
  "orders/shipmentPacked": shipmentPacked,
  "orders/shipmentPicked": shipmentPicked,
  "orders/shipmentShipped": shipmentShipped,
  "orders/updateHistory": updateHistory
};
