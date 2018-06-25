import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/server/api/core";

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
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  return Orders.update(
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
}
