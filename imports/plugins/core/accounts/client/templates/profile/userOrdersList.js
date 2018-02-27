import { Template } from "meteor/templating";
import { Components } from "@reactioncommerce/reaction-components";

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

    return {
      component: Components.OrdersList,
      orders
    };
  }
});
