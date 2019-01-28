import Logger from "@reactioncommerce/logger";
import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import sendOrderEmail from "../util/sendOrderEmail";

/**
 * @name orderQuantityAdjust
 * @method
 * @private
 * @param  {String} orderId      orderId
 * @param  {Object} refundedItem refunded item
 * @return {null} no return value
 */
function orderQuantityAdjust(orderId, refundedItem) {
  check(orderId, String);

  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const order = Orders.findOne({ _id: orderId });
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
  orderItems.forEach((item) => {
    if (item._id === refundedItem.id) {
      const itemId = item._id;
      const newQuantity = item.quantity - refundedItem.refundedQuantity;

      Orders.update(
        {
          _id: orderId,
          items: { $elemMatch: { _id: itemId } }
        },
        {
          $set: { "items.$.quantity": newQuantity }
        }
      );
    }
  });

  const updatedOrder = Orders.findOne({ _id: orderId });
  Promise.await(appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: Reaction.getUserId()
  }));
}

/**
 * @name orders/refunds/refundItems
 * @method
 * @memberof Orders/Methods
 * @summary Apply a refund to line items
 * @param {String} orderId - order object
 * @param {String} paymentId - ID of payment to refund
 * @param {Object} refundItemsInfo - info about refund items
 * @return {Object} refund boolean and result/error value
 */
export default function refundItemsMethod(orderId, paymentId, refundItemsInfo) {
  check(orderId, String);
  check(paymentId, String);
  check(refundItemsInfo, Object);

  // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const fut = new Future();
  const order = Orders.findOne({ _id: orderId });
  const { items: refundItems, quantity, total: amount } = refundItemsInfo;
  const originalQuantity = order.totalItemQuantity;

  // refund payment to customer
  Meteor.call("orders/refunds/create", order._id, paymentId, Number(amount), false, (error, result) => {
    if (error) {
      Logger.fatal("Attempt for refund transaction failed", order._id, paymentId, error);
      fut.return({
        refund: false,
        error
      });
    }
    if (result) {
      refundItems.forEach((refundItem) => {
        orderQuantityAdjust(orderId, refundItem);
      });

      let refundedStatus = "refunded";

      if (quantity < originalQuantity) {
        refundedStatus = "partialRefund";
      }

      const updateResult = Orders.update(
        {
          "_id": orderId,
          "shipping.payment._id": paymentId
        },
        {
          $set: {
            "shipping.$.payment.status": refundedStatus
          }
        }
      );

      if (updateResult !== 1) {
        throw new ReactionError("server-error", "Unable to update order");
      }

      const updatedOrder = Orders.findOne({ _id: orderId });
      Promise.await(appEvents.emit("afterOrderUpdate", {
        order: updatedOrder,
        updatedBy: Reaction.getUserId()
      }));

      sendOrderEmail(order, "itemRefund");

      fut.return({
        refund: true,
        result
      });
    }
  });
  return fut.wait();
}
