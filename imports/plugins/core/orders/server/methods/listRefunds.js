import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/server/api/core";

/**
 * @name orders/refund/list
 * @summary loop through order's payments and find existing refunds.
 * Get a list of refunds for a particular payment method.
 * @method
 * @memberof Orders/Methods
 * @param {Object} order - order object
 * @return {Array} Array contains refund records
 */
export default function listRefunds(order) {
  check(order, Object);

  if (!this.userId === order.userId && !Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const refunds = [];
  for (const billingRecord of order.billing) {
    const { paymentMethod } = billingRecord;
    const processor = paymentMethod.processor.toLowerCase();
    const shopRefunds = Meteor.call(`${processor}/refund/list`, paymentMethod);
    refunds.push(...shopRefunds);
  }
  return refunds;
}
