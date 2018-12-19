import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import ReactionError from "@reactioncommerce/reaction-error";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/core/server/no-meteor/pluginRegistration";


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
    throw new ReactionError("access-denied", "Access Denied");
  }
  const shopId = Reaction.getShopId(); // the shopId of the current user, i.e. merchant
  const order = Orders.findOne({ _id: orderId });
  // find the appropriate shipping record by shop
  const fulfillmentGroup = order.shipping.find((group) => group.shopId === shopId);
  const { _id: groupId, payment, itemIds } = fulfillmentGroup;

  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

  if (order.workflow.status === "new") {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);
  }

  // find the payment based on shopId
  const { mode, name, status, transactionId } = payment;

  if (mode === "capture" && status === "approved" && name) {
    let result;
    let error;
    try {
      const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
      result = Promise.await(getPaymentMethodConfigByName(name).functions.capturePayment(context, payment));
    } catch (err) {
      error = err;
    }

    if (result && result.saved === true) {
      const metadata = Object.assign({}, payment.metadata || {}, result.metadata || {});

      Orders.update(
        {
          "_id": orderId,
          "shipping._id": groupId
        },
        {
          $set: {
            "shipping.$.payment.mode": "capture",
            "shipping.$.payment.status": "completed",
            "shipping.$.payment.metadata": metadata
          },
          $push: {
            "shipping.$.payment.transactions": result
          }
        }
      );

      // event onOrderPaymentCaptured used for confirmation hooks
      // ie: confirmShippingMethodForOrder is triggered here
      Hooks.Events.run("onOrderPaymentCaptured", orderId);
      return { error, result };
    }

    if (result && result.error) {
      Logger.fatal("Failed to capture transaction.", order, transactionId, result.error);
    } else {
      Logger.fatal("Failed to capture transaction.", order, transactionId, error);
    }

    Orders.update(
      {
        "_id": orderId,
        "shipping._id": groupId
      },
      {
        $set: {
          "shipping.$.payment.mode": "capture",
          "shipping.$.payment.status": "error"
        },
        $push: {
          "shipping.$.payment.transactions": result
        }
      }
    );

    return { error: "orders/capturePayments: Failed to capture transaction" };
  }

  return { error: null, result: null };
}
