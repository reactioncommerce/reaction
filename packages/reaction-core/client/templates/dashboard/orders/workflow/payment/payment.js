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
  "click .btn": function () {
    Meteor.call("orders/capturePayments", this._id);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreProcessPayment", this._id);
  }
});

Template.coreProcessPayment.helpers({
  order() {
    let template = Template.instance();
    return template.order;
  }
});
