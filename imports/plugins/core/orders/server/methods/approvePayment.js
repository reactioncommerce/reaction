import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orders/approvePayment
 * @method
 * @memberof Orders/Methods
 * @summary Approve payment and apply any adjustments
 * @param {String} orderId - The order ID
 * @param {String} paymentId - The payment ID
 * @return {Object} The updated order document
 */
export default function approvePayment(orderId, paymentId) {
  check(orderId, String);
  check(paymentId, String);

  const shopId = Reaction.getShopId();
  const authUserId = Reaction.getUserId();

  if (!Reaction.hasPermission("orders", authUserId, shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const dbOrder = Orders.findOne({
    _id: orderId,
    shopId
  });
  if (!dbOrder) throw new ReactionError("not-found", "Order not found");

  Orders.update({
    _id: orderId,
    payments: {
      $elemMatch: {
        _id: paymentId,
        status: { $in: ["adjustments", "created"] }
      }
    }
  }, {
    $set: {
      "payments.$.status": "approved"
    }
  });

  const updatedOrder = Orders.findOne({ _id: orderId });
  Promise.await(appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: authUserId
  }));
  Promise.await(appEvents.emit("afterOrderApprovePayment", {
    approvedBy: authUserId,
    order: updatedOrder
  }));

  return updatedOrder;
}
