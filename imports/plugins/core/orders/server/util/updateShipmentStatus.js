import { Meteor } from "meteor/meteor";
import { Orders } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @summary Expected to be called from a Meteor method
 * @param {Object} input Arguments
 * @param {String} input.fulfillmentGroupId ID of fulfillment group to update status for
 * @param {String[]} input.fulfillmentGroupItemIds Array of item IDs in this group
 * @param {Object} order The order that contains the group
 * @param {String} status The new status for the group
 * @returns {Number} Orders.update result
 */
export default function updateShipmentStatus(input) {
  const {
    fulfillmentGroupId,
    fulfillmentGroupItemIds,
    order,
    status
  } = input;

  const authUserId = Reaction.getUserId();
  if (!Reaction.hasPermission("orders", authUserId, order.shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const result = Meteor.call("workflow/pushItemWorkflow", `coreOrderItemWorkflow/${status}`, order, fulfillmentGroupItemIds);
  if (result !== 1) {
    throw new ReactionError("server-error", "Unable to update order");
  }

  const newStatus = `coreOrderWorkflow/${status}`;

  const updateResult = Orders.update(
    {
      "_id": order._id,
      "shipping._id": fulfillmentGroupId
    },
    {
      $set: {
        "shipping.$.workflow.status": newStatus
      },
      $push: {
        "shipping.$.workflow.workflow": newStatus
      }
    },
    { bypassCollection2: true }
  );

  const updatedOrder = Orders.findOne({ _id: order._id });
  Promise.await(appEvents.emit("afterOrderUpdate", {
    order: updatedOrder,
    updatedBy: authUserId
  }));

  return updateResult;
}
