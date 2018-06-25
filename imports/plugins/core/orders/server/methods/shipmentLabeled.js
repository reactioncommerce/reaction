import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name orders/shipmentLabeled
 * @method
 * @memberof Orders/Methods
 * @summary update labeling status
 * @param {Object} order - order object
 * @param {Object} shipment - shipment object
 * @return {Object} return workflow result
 */
export default function shipmentLabeled(order, shipment) {
  check(order, Object);
  check(shipment, Object);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Set the status of the items as labeled
  const itemIds = shipment.items.map((item) => item._id);

  const result = Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/labeled", order, itemIds);
  if (result === 1) {
    return Orders.update(
      {
        "_id": order._id,
        "shipping._id": shipment._id
      },
      {
        $set: {
          "shipping.$.workflow.status": "coreOrderWorkflow/labeled"
        },
        $push: {
          "shipping.$.workflow.workflow": "coreOrderWorkflow/labeled"
        }
      },
      { bypassCollection2: true }
    );
  }
  return result;
}
