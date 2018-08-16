import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import sendOrderEmail from "../util/sendOrderEmail";

/**
 * @name orders/shipmentShipped
 * @method
 * @memberof Orders/Methods
 * @summary trigger shipmentShipped status and workflow update
 * @param {Object} order - order object
 * @param {Object} shipment - shipment object
 * @return {Object} return results of several operations
 */
export default function shipmentShipped(order, shipment) {
  check(order, Object);
  check(shipment, Object);

  // TODO: Who should have access to ship shipments in a marketplace setting
  // Should be anyone who has product in an order.
  if (!Reaction.hasPermission("orders")) {
    Logger.error("User does not have 'orders' permissions");
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  this.unblock();

  let completedItemsResult;
  let completedOrderResult;

  const itemIds = shipment.items.map((item) => item._id);

  // TODO: In the future, this could be handled by shipping delivery status
  // REVIEW: This hook seems to run before the shipment has been marked as shipped
  Hooks.Events.run("onOrderShipmentShipped", order, itemIds);
  const workflowResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/shipped", order, itemIds);

  if (workflowResult === 1) {
    // Move to completed status for items
    completedItemsResult = Meteor.call(
      "workflow/pushItemWorkflow",
      "coreOrderItemWorkflow/completed",
      order,
      itemIds
    );

    if (completedItemsResult === 1) {
      // Then try to mark order as completed.
      completedOrderResult = Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
    }
  }

  sendOrderEmail(order, "shipped");

  Orders.update(
    {
      "_id": order._id,
      "shipping._id": shipment._id
    },
    {
      $set: {
        "shipping.$.workflow.status": "coreOrderWorkflow/shipped"
      },
      $push: {
        "shipping.$.workflow.workflow": "coreOrderWorkflow/shipped"
      }
    },
    { bypassCollection2: true }
  );

  return {
    workflowResult,
    completedItems: completedItemsResult,
    completedOrder: completedOrderResult
  };
}
