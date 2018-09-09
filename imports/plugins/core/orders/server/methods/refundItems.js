import Logger from "@reactioncommerce/logger";
import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
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
  order.items.forEach((item) => {
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
  const originalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

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

      Orders.update(
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

      sendOrderEmail(order, "itemRefund");

      fut.return({
        refund: true,
        result
      });
    }
  });
  return fut.wait();
}
