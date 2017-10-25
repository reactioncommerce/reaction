import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";
import { Reaction } from "/client/api";
import CompletedOrder from "/imports/plugins/core/accounts/client/containers/userOrdersListContainer";

/**
 * @method getOrders
 * @summary returns user's orders
 * @since 1.5.1
 * @return {Array} - an array of orders
 */
function getOrders() {
  const targetUserId = Reaction.Router.getQueryParam("userId") ||
  Meteor.userId();
  return Orders.find({ userId: targetUserId }, {
    sort: {
      createdAt: -1
    },
    limit: 25
  });
}

/**
 * userOrdersList helpers
 *
 */
Template.userOrdersList.helpers({
  hasData(data) {
    if (data.hash.data) {
      if (data.hash.data.count() > 0) {
        return true;
      }
      return false;
    }
    return false;
  },

  // Returns React Component
  completedOrders() {
    const orders = getOrders();
    return { component: CompletedOrder,
      orders
    };
  }
});
