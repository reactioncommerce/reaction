import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Template } from "meteor/templating";
import { Orders } from "/lib/collections";
import OrderSummaryContainer from "../../containers/orderSummaryContainer";

Template.coreOrderShippingSummary.onCreated(() => {
  const template = Template.instance();
  const currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId, shipmentId) {
    template.orderDep.depend();
    return Orders.findOne({
      "_id": orderId,
      "shipping._id": shipmentId
    });
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId, currentData.fulfillment._id);
  });
});

/*
 * automatically start order processing on first view
 */

Template.coreOrderShippingSummary.onRendered(function () {
  const template = Template.instance();
  const order = template.order;

  if (order.workflow) {
    if (order.workflow.status === "coreOrderCreated") {
      order.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order);
    }
  }
});

Template.coreOrderShippingSummary.helpers({
  orderSummary() {
    return OrderSummaryContainer;
  },
  order() {
    const template = Template.instance();
    return template.order;
  }
});
