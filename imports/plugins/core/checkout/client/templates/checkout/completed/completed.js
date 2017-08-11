import { Template } from "meteor/templating";
import CompletedOrderContainer from "/imports/plugins/core/checkout/client/containers/completedOrderContainer";

/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.helpers({
  completedOrder: function () {
    return { component: CompletedOrderContainer };
  }
});
