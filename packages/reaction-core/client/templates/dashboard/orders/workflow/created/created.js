Template.coreOrderCreated.onCreated(() => {
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

/*
 * automatically start order processing on first view
 */

Template.coreOrderCreated.onRendered(function () {
  let template = Template.instance();
  let order = template.order;

  if (order.workflow) {
    if (order.workflow.status === "coreOrderCreated") {
      order.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", order._id);
    }
  }
});

/**
 * coreOrderCreated events
 *
 */
Template.coreOrderCreated.events({
  'click .btn': function () {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
  }
});


Template.coreOrderCreated.helpers({
  order() {
    let template = Template.instance();
    return template.order;
  }
});
