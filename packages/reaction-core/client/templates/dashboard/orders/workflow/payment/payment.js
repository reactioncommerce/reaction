Template.coreProcessPayment.onCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId);
  });
});

/**
 * stateHelperPayment events
 *
 */
Template.coreProcessPayment.events({
  "click [data-event-action=capturePayment]": () => {
    let template = Template.instance();

    Meteor.call("orders/capturePayments", template.order._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", template.order._id);
  }
});

Template.coreProcessPayment.helpers({
  order() {
    let template = Template.instance();
    return template.order;
  },

  paymentApproved() {
    let template = Template.instance();
    return template.order.billing[0].paymentMethod.status === "approved";
  }
});
