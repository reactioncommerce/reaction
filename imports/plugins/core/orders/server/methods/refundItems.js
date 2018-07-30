import Logger from "@reactioncommerce/logger";
import Future from "fibers/future";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import { PaymentMethodArgument } from "/lib/collections/schemas";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";
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
 * @param {Object} paymentMethod - paymentMethod object
 * @param {Object} refundItemsInfo - info about refund items
 * @return {Object} refund boolean and result/error value
 */
export default function refundItemsMethod(orderId, paymentMethod, refundItemsInfo) {
  check(orderId, String);
  check(refundItemsInfo, Object);

  // Call both check and validate because by calling `clean`, the audit pkg
  // thinks that we haven't checked paymentMethod arg
  check(paymentMethod, Object);
  PaymentMethodArgument.validate(PaymentMethodArgument.clean(paymentMethod));

  // REVIEW: For marketplace implementations, who can refund? Just the marketplace?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const fut = new Future();
  const order = Orders.findOne({ _id: orderId });
  const { transactionId } = paymentMethod;
  const amount = refundItemsInfo.total;
  const { quantity } = refundItemsInfo;
  const refundItems = refundItemsInfo.items;
  const originalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);

  // refund payment to customer
  Meteor.call("orders/refunds/create", order._id, paymentMethod, Number(amount), false, (error, result) => {
    if (error) {
      Logger.fatal("Attempt for refund transaction failed", order._id, paymentMethod.transactionId, error);
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
          "billing.shopId": Reaction.getShopId(),
          "billing.paymentMethod.transactionId": transactionId
        },
        {
          $set: {
            "billing.$.paymentMethod.status": refundedStatus
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
