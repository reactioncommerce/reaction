import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import sendOrderEmail from "../util/sendOrderEmail";

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
    throw new ReactionError("access-denied", "Access Denied");
  }

  this.unblock();

  const fulfillmentGroup = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());

  sendOrderEmail(order);

  const { itemIds } = fulfillmentGroup;

  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/delivered", order, itemIds);
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, itemIds);

  const isCompleted = order.items.every((item) => item.workflow.workflow && item.workflow.workflow.includes("coreOrderItemWorkflow/completed"));

  Orders.update(
    {
      "_id": order._id,
      "shipping._id": fulfillmentGroup._id
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
