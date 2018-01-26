import { Template } from "meteor/templating";
import CompletedOrderContainer from "/imports/plugins/core/checkout/client/containers/completedOrderContainer";

/**
 * cartCompleted helpers
 *
 * if order status = new translate submitted message
 */
Template.cartCompleted.helpers({
  completedOrder() {
    return { component: CompletedOrderContainer };
  }
});
