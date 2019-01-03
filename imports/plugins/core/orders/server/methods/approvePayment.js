import Hooks from "@reactioncommerce/hooks";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import appEvents from "/imports/node-app/core/util/appEvents";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orders/approvePayment
 * @method
 * @memberof Orders/Methods
 * @summary Approve payment and apply any adjustments
 * @param {String} orderId - The order ID
 * @param {String} paymentId - The payment ID
 * @return {undefined}
 */
export default function approvePayment(orderId, paymentId) {
  check(orderId, String);
  check(paymentId, String);

  const shopId = Reaction.getShopId();

  if (!Reaction.hasPermission("orders", Reaction.getUserId(), shopId)) {
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

  Promise.await(appEvents.emit("afterOrderApprovePayment", dbOrder));

  // Update search record
  Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", dbOrder);
}
