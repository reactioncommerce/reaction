import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
import { getPaymentMethodConfigByName } from "/imports/plugins/core/payments/server/no-meteor/registration";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @name orders/cancelOrder
 * @method
 * @memberof Orders/Methods
 * @summary Start the cancel order process
 * @param {Object} order - order object
 * @param {Boolean} returnToStock - condition to return product to stock
 * @return {Object} ret
 */
export default function cancelOrder(order, returnToStock) {
  check(order, Object);
  check(returnToStock, Boolean);

  if (!Reaction.hasPermission("orders", Reaction.getUserId(), order.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // refund all payments to customer
  (order.payments || []).forEach((payment) => {
    switch (payment.status) {
      case "completed":
      case "partialRefund":
        if (getPaymentMethodConfigByName(payment.name).canRefund) {
          Meteor.call("orders/refunds/create", order._id, payment._id, payment.amount);
        }
        break;

      case "created":
      case "approved":
        Orders.update(
          {
            "_id": order._id,
            "payments._id": payment._id
          },
          {
            $set: {
              "payments.$.status": "canceled"
            }
          }
        );
        break;
      default:
        break;
    }
  });

  // update item workflow
  const orderItemIds = order.shipping.reduce((list, group) => [...list, ...group.items], []).map((item) => item._id);
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, orderItemIds);

  const result = Orders.update({
    _id: order._id,
    shopId: order.shopId
  }, {
    $set: {
      "workflow.status": "coreOrderWorkflow/canceled"
    },
    $push: {
      "workflow.workflow": "coreOrderWorkflow/canceled"
    }
  });

  Promise.await(appEvents.emit("afterOrderCancel", { order, returnToStock }));

  // send notification to user
  const { accountId } = order;

  if (accountId) {
    const prefix = Reaction.getShopPrefix();
    const url = `${prefix}/notifications`;
    createNotification(rawCollections, { accountId, type: "orderCanceled", url }).catch((error) => {
      Logger.error("Error in createNotification within shipmentShipped", error);
    });
  }

  return result;
}
