import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { Orders } from "/lib/collections";

const workflowStatusOrderCounts = {};

/**
 * orders/count
 *
 * @summary Count number of orders per workflow status
 * @return {Array} Array of counts for each status
 */
workflowStatusOrderCounts.countOrdersByWorkflowStatus = function () {
  const shopId = Reaction.getShopId();
  const pipeline = [
     { $match: { shopId: shopId } },
     { $group: { _id: "$workflow.status", count: { $sum: 1 } } }
  ];
  const orders = Orders.rawCollection();

  return Meteor.wrapAsync(orders.aggregate.bind(orders))(pipeline);
};

Meteor.methods({
  "orders/count": workflowStatusOrderCounts.countOrdersByWorkflowStatus
});
