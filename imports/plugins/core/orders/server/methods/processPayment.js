import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/processPayment
 * @method
 * @memberof Orders/Methods
 * @summary trigger processPayment and workflow update
 * @param {Object} order - order object
 * @return {Object} return this.processPayment result
 */
export default function processPayment(order) {
  check(order, Object);

  // REVIEW: Who should have access to process payment in marketplace?
  // Probably just the shop owner for now?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  this.unblock();

  return Meteor.call("orders/processPayments", order._id, function (error, result) {
    if (result) {
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", order._id);

      const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());
      // Set the status of the items as shipped
      const itemIds = shippingRecord.items.map((item) => item._id);

      Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/captured", order, itemIds);

      return this.processPayment(order);
    }
    return false;
  });
}
