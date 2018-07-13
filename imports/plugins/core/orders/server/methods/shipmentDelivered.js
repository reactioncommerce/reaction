import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orders/shipmentDelivered
 * @method
 * @memberof Orders/Methods
 * @summary trigger shipmentShipped status and workflow update
 * @param {Object} order - order object
 * @return {Object} return workflow result
 */
export default function shipmentDelivered(order) {
  check(order, Object);

  // REVIEW: this should be callable from the server via callback from Shippo or other webhook
  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  this.unblock();

  const shipment = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());

  if (order.email) {
    Meteor.call("orders/sendNotification", order, (err) => {
      if (err) {
        Logger.error(err, "orders/shipmentDelivered: Failed to send notification");
      }
    });
  } else {
    Logger.warn("No order email found. No notification sent.");
  }

  const itemIds = shipment.items.map((item) => item._id);

  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/delivered", order, itemIds);
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

  const isCompleted = order.items.every((item) => item.workflow.workflow && item.workflow.workflow.includes("coreOrderItemWorkflow/completed"));

  Orders.update(
    {
      "_id": order._id,
      "shipping._id": shipment._id
    },
    {
      $set: {
        "shipping.$.workflow.status": "coreOrderWorkflow/delivered"
      },
      $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/delivered"
      }
    },
    { bypassCollection2: true }
  );

  if (isCompleted === true) {
    Hooks.Events.run("onOrderShipmentDelivered", order._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
    return true;
  }

  Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "processing", order);

  return false;
}
