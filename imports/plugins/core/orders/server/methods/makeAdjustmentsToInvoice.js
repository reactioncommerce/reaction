import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @name orders/makeAdjustmentsToInvoice
 * @method
 * @memberof Orders/Methods
 * @summary Update the status of an invoice to allow adjustments to be made
 * @param {Object} order - order object
 * @return {Object} Mongo update
 */
export default function makeAdjustmentsToInvoice(order) {
  check(order, Object);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  this.unblock(); // REVIEW: Why unblock here?

  return Orders.update(
    {
      "_id": order._id,
      "billing.shopId": Reaction.getShopId(),
      "billing.paymentMethod.method": "credit"
    },
    {
      $set: {
        "billing.$.paymentMethod.status": "adjustments"
      }
    }
  );
}
