import { check } from "meteor/check";
import updateShipmentStatus from "../util/updateShipmentStatus";

/**
 * @name orders/shipmentLabeled
 * @method
 * @memberof Orders/Methods
 * @summary update labeling status
 * @param {Object} order - order object
 * @param {Object} fulfillmentGroup - fulfillmentGroup object
 * @return {Object} return workflow result
 */
export default function shipmentLabeled(order, fulfillmentGroup) {
  check(order, Object);
  check(fulfillmentGroup, Object);

  return updateShipmentStatus({
    fulfillmentGroupId: fulfillmentGroup._id,
    fulfillmentGroupItemIds: fulfillmentGroup.itemIds,
    order,
    status: "labeled"
  });
}
