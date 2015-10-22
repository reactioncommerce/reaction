Template.coreOrderCompleted.coreOrderCreated(() => {
  let template = Template.instance();
  let currentData = Template.currentData();

  template.orderDep = new Tracker.Dependency;
  template.showTrackingEditForm = ReactiveVar(false);

  function getOrder(orderId) {
    template.orderDep.depend();
    return ReactionCore.Collections.Orders.findOne(orderId);
  }

  Tracker.autorun(() => {
    template.order = getOrder(currentData.orderId);
  });
});

Template.coreOrderCompleted.heleprs({
  isComplete() {
    const template = Template.instance();
    const order = template.order;

    return order.shipping[0].workflow.status === "coreOrderCompleted";
  },

  workflow() {
    const template = Template.instance();
    const order = template.order;

    return order.shipping[0].workflow;
  }
});
