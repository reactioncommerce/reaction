import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

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

  if (!Reaction.getUserId()) {
    throw new ReactionError("access-denied", "Access Denied. You are not connected.");
  }

  return Orders.update({ cartId }, { $set: { email } });
}
