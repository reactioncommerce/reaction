import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name orders/shipmentPacked
 * @method
 * @memberof Orders/Methods
 * @summary update packing status
 * @param {Object} order - order object
 * @param {Object} fulfillmentGroup - fulfillmentGroup object
 * @return {Object} return workflow result
 */
export default function shipmentPacked(order, fulfillmentGroup) {
  check(order, Object);
  check(fulfillmentGroup, Object);

  // REVIEW: who should have permission to do this in a marketplace setting?
  // Do we need to update the order schema to reflect multiple packers / shipments?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Set the status of the items as packed
  const { itemIds } = fulfillmentGroup;

  const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/packed", order, itemIds);
  if (result === 1) {
    return Orders.update(
      {
        "_id": order._id,
        "shipping._id": fulfillmentGroup._id
      },
      {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/packed"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/packed"
        }
      },
      { bypassCollection2: true }
    );
  }
  return result;
}
