import { check, Match } from "meteor/check";
import { Accounts, Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import sendOrderEmail from "../util/sendOrderEmail";

/**
 * @name orders/sendNotification
 * @method
 * @memberof Orders/Methods
 * @summary send order notification email
 * @param {String} orderId - The order ID
 * @param {String} action - send notification action
 * @return {Boolean} email sent or not
 */
export default function sendNotification(orderId, action) {
  check(orderId, String);
  check(action, Match.OneOf(String, undefined));

  const order = Orders.findOne({ _id: orderId });
  if (!order) {
    throw new ReactionError("not-found", "No order found with that ID");
  }

  const account = this.userId ? Accounts.findOne({ userId: this.userId }) : null;
  const contextAccountId = account && account._id;
  if (order.accountId !== contextAccountId && !Reaction.hasPermission("orders", this.userId, order.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  this.unblock();

  return sendOrderEmail(order, action);
}
