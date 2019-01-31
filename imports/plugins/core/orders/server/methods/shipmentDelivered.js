import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import sendOrderEmail from "../util/sendOrderEmail";
import updateShipmentStatus from "../util/updateShipmentStatus";

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

  const currentShopId = Reaction.getShopId();
  const fulfillmentGroup = order.shipping.find((shipping) => shipping.shopId === currentShopId);

  updateShipmentStatus({
    fulfillmentGroupId: fulfillmentGroup._id,
    fulfillmentGroupItemIds: fulfillmentGroup.itemIds,
    order,
    status: "delivered"
  });

  sendOrderEmail(order, "delivered");

  return true;
}
