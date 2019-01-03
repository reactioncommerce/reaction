import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
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

  // REVIEW: Only marketplace admins should be able to cancel entire order?
  // Unless order is entirely contained in a single shop? Do we need a switch on marketplace owner dashboard?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // refund payment to customer
  (order.payments || []).forEach((payment) => {
    Meteor.call("orders/refunds/create", order._id, payment._id, payment.amount);
  });

  // update item workflow
  const orderItemIds = order.shipping.reduce((list, group) => [...list, ...group.items], []).map((item) => item._id);
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, orderItemIds);

  const result = Orders.update({
    _id: order._id
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
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  createNotification(rawCollections, { accountId, type: "orderCanceled", url }).catch((error) => {
    Logger.error("Error in createNotification within shipmentShipped", error);
  });

  return result;
}
