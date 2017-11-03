import { Template } from "meteor/templating";
import UserOrdersList from "/imports/plugins/core/accounts/client/containers/userOrdersListContainer";

/**
 * userOrdersList helpers
 *
 */
Template.userOrdersList.helpers({
  // Returns React Component
  completedOrders() {
    let orders;

    if (Template.currentData() && Template.currentData().data) {
      orders = Template.currentData().data.fetch();
    } else {
      orders = [];
    }

    return { component: UserOrdersList,
      orders
    };
  }
});
