import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orders/capturePayments
 * @summary Finalize any payment where mode is "authorize"
 * and status is "approved", reprocess as "capture"
 * @method
 * @memberof Orders/Methods
 * @param {String} orderId - add tracking to orderId
 * @return {null} no return value
 */
export default function capturePayments(orderId) {
  check(orderId, String);
  // REVIEW: For marketplace implementations who should be able to capture payments?
  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  const shopId = Reaction.getShopId(); // the shopId of the current user, i.e. merchant
  const order = Orders.findOne(orderId);
  // find the appropriate shipping record by shop
  const shippingRecord = order.shipping.find((sRecord) => sRecord.shopId === shopId);
  const itemIds = shippingRecord.items.map((item) => item._id);

  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

  if (order.workflow.status === "new") {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
  }

  // process order..payment.paymentMethod
  // find the billing record based on shopId
  const billingRecord = order.billing.find((bRecord) => bRecord.shopId === shopId);

  const { paymentMethod } = billingRecord;
  const { transactionId } = paymentMethod;

  if (paymentMethod.mode === "capture" && paymentMethod.status === "approved" && paymentMethod.processor) {
    // Grab the amount from the shipment, otherwise use the original amount
    const processor = paymentMethod.processor.toLowerCase();

    let result;
    let error;
    try {
      result = Meteor.call(`${processor}/payment/capture`, paymentMethod);
    } catch (e) {
      error = e;
    }

    if (result && result.saved === true) {
      const metadata = Object.assign(billingRecord.paymentMethod.metadata || {}, result.metadata || {});

      Orders.update(
        {
          "_id": orderId,
          "billing.paymentMethod.transactionId": transactionId
        },
        {
          $set: {
            "billing.$.paymentMethod.mode": "capture",
            "billing.$.paymentMethod.status": "completed",
            "billing.$.paymentMethod.metadata": metadata
          },
          $push: {
            "billing.$.paymentMethod.transactions": result
          }
        }
      );

      // event onOrderPaymentCaptured used for confirmation hooks
      // ie: confirmShippingMethodForOrder is triggered here
      Hooks.Events.run("onOrderPaymentCaptured", orderId);
      return { error, result };
    }

    if (result && result.error) {
      Logger.fatal("Failed to capture transaction.", order, paymentMethod.transactionId, result.error);
    } else {
      Logger.fatal("Failed to capture transaction.", order, paymentMethod.transactionId, error);
    }

    Orders.update(
      {
        "_id": orderId,
        "billing.paymentMethod.transactionId": transactionId
      },
      {
        $set: {
          "billing.$.paymentMethod.mode": "capture",
          "billing.$.paymentMethod.status": "error"
        },
        $push: {
          "billing.$.paymentMethod.transactions": result
        }
      }
    );

    return { error: "orders/capturePayments: Failed to capture transaction" };
  }
}
