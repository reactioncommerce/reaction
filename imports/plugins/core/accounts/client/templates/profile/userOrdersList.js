import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";
import CompletedOrder from "/imports/plugins/core/accounts/client/containers/userOrdersListContainer";


/**
 * userOrdersList helpers
 *
 */
Template.userOrdersList.helpers({
  orders(data) {
    if (data.hash.data) {
      return data.hash.data;
    }
    const orders = Orders.find({}, {
      sort: {
        createdAt: -1
      },
      limit: 25
    });
    return orders;
  },

  // Returns React Component
  completedOrder() {
    const order = this;
    return { component: CompletedOrder,
      order
    };
  }
});
