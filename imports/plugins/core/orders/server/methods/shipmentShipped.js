import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
import sendOrderEmail from "../util/sendOrderEmail";
import updateShipmentStatus from "../util/updateShipmentStatus";

/**
 * @name orders/shipmentShipped
 * @method
 * @memberof Orders/Methods
 * @summary trigger shipmentShipped status and workflow update
 * @param {Object} order - order object
 * @param {Object} fulfillmentGroup - fulfillmentGroup object
 * @return {Object} return results of several operations
 */
export default function shipmentShipped(order, fulfillmentGroup) {
  check(order, Object);
  check(fulfillmentGroup, Object);

  const fulfillmentGroupItemIds = fulfillmentGroup.itemIds;
  updateShipmentStatus({
    fulfillmentGroupId: fulfillmentGroup._id,
    fulfillmentGroupItemIds,
    order,
    status: "shipped"
  });

  // Notify by email
  sendOrderEmail(order, "shipped");

  // Notify by in-app notification
  const { accountId } = order;
  const type = "orderShipped";
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  createNotification(rawCollections, { accountId, type, url }).catch((error) => {
    Logger.error("Error in createNotification within shipmentShipped", error);
  });

  // Now move item statuses to completed
  const completedItemsResult = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/completed", order, fulfillmentGroupItemIds);

  // Then try to mark order as completed.
  if (completedItemsResult === 1) {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "completed", order);
  }
}
