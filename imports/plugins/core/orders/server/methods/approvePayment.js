import accounting from "accounting-js";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import orderCreditMethod from "../util/orderCreditMethod";

/**
 * @name orders/approvePayment
 * @method
 * @memberof Orders/Methods
 * @summary Approve payment and apply any adjustments
 * @param {Object} order - order object
 * @return {Object} return this.processPayment result
 */
export default function approvePayment(order) {
  check(order, Object);
  const { invoice } = orderCreditMethod(order);

  // REVIEW: Who should have access to do this for a marketplace?
  // Do we have/need a shopId on each order?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  this.unblock(); // REVIEW: why unblock here?

  // this is server side check to verify
  // that the math all still adds up.
  const shopId = Reaction.getShopId();
  const { discounts, shipping, subtotal, taxes } = invoice;
  const discountTotal = Math.max(0, subtotal - discounts); // ensure no discounting below 0.
  const total = accounting.toFixed(Number(discountTotal) + Number(shipping) + Number(taxes), 2);

  const result = Orders.update(
    {
      "_id": order._id,
      "shipping.shopId": shopId,
      "shipping.payment.method": "credit"
    },
    {
      $set: {
        "shipping.$.payment.amount": total,
        "shipping.$.payment.status": "approved",
        "shipping.$.payment.mode": "capture",
        "shipping.$.payment.invoice.discounts": discounts,
        "shipping.$.payment.invoice.total": Number(total)
      }
    }
  );
  if (result !== 1) {
    throw new ReactionError("server-error", "Unable to update order");
  }

  const updatedOrder = Orders.findOne({ _id: order._id });
  Promise.await(appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: Reaction.getUserId()
  }));
  Promise.await(appEvents.emit("afterOrderApprovePayment", {
    approvedBy: Reaction.getUserId(),
    order: updatedOrder
  }));

  return result;
}
