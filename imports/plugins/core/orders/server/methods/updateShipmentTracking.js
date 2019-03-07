import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/updateShipmentTracking
 * @summary Adds tracking information to order without workflow update.
 * Call after any tracking code is generated
 * @method
 * @memberof Orders/Methods
 * @param {Object} order - An Order object
 * @param {Object} shipment - A Shipment object
 * @param {String} tracking - tracking id
 * @return {String} returns order update result
 */
export default function updateShipmentTracking(order, shipment, tracking) {
  check(order, Object);
  check(shipment, Object);
  check(tracking, String);

  // REVIEW: This method should be callable from a webhook (e.g. Shippo)
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const result = Orders.update(
    {
      "_id": order._id,
      "shipping._id": shipment._id
    },
    {
      $set: {
        "shipping.$.tracking": tracking
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

  return result;
}
