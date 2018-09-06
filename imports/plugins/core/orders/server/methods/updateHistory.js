import { check, Match } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/updateHistory
 * @method
 * @memberof Orders/Methods
 * @summary adds order history item for tracking and logging order updates
 * @param {String} orderId - add tracking to orderId
 * @param {String} event - workflow event
 * @param {String} value - event value
 * @return {String} returns order update result
 */
export default function updateHistory(orderId, event, value) {
  check(orderId, String);
  check(event, String);
  check(value, Match.Optional(String));

  // REVIEW: For marketplace implementations
  // This should be possible for anyone with permission to act on the order
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return Orders.update(orderId, {
    $addToSet: {
      history: {
        event,
        value,
        userId: Reaction.getUserId(),
        updatedAt: new Date()
      }
    }
  });
}
