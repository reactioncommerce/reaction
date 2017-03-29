import { Meteor } from "meteor/meteor";
import { Reaction } from "/server/api";
import { Orders } from "/lib/collections";

const workflowStatusOrderCounts = {};

/**
 * orders/count
 *
 * @summary Count number of orders per workflow status
 * @param {String} filterName - string to filter by
 * @return {Array} Array of counts for each status
 */
workflowStatusOrderCounts.countOrdersByWorkflowStatus = function () {
  const shopId = Reaction.getShopId();

  Orders.rawCollection().aggregate([
     { $match: { shopId: shopId } },
     { $group: { _id: "$workflow.status", count: { $sum: 1 } } }
  ], (error, result) => {
    if (error) {
      throw new Meteor.Error("Error fetching order count", error);
    }

    return result;
  });
};

Meteor.methods({
  "orders/count": workflowStatusOrderCounts.countOrdersByWorkflowStatus
});
