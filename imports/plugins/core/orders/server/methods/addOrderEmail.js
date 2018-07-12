import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";

/**
 * @name orders/addOrderEmail
 * @method
 * @memberof Orders/Methods
 * @summary Adds email to order, used for guest users
 * @param {String} cartId - add tracking to orderId
 * @param {String} email - valid email address
 * @return {String} returns order update result
 */
export default function addOrderEmail(cartId, email) {
  check(cartId, String);
  check(email, String);
  /**
   *Instead of checking the Orders permission, we should check if user is
    *connected.This is only needed for guest where email is
    *provided for tracking order progress.
    */

  if (!Meteor.userId()) {
    throw new Meteor.Error("access-denied", "Access Denied. You are not connected.");
  }

  return Orders.update({ cartId }, { $set: { email } });
}
