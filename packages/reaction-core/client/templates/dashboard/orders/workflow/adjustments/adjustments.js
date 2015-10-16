Template.coreOrderAdjustments.onCreated(() => {
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
 * coreOrderAdjustments events
 */
Template.coreOrderAdjustments.events({

  /**
   * Submit form
   * @param  {Event} event - Event object
   * @param  {Template} template - Blaze Template
   * @return {void}
   */
  "submit form": (event, template) => {
    event.preventDefault();

    let order = template.order;
    let discount = parseFloat(event.target.discount_amount.value) || 0;

    Meteor.call("orders/applyDiscount", order, discount, (error) => {
      if (error) {
        // Show error
      }
    });
  }
});


/**
 * coreOrderAdjustments helpers
 */
Template.coreOrderAdjustments.helpers({

  /**
   * Discount
   * @return {Number} current discount amount
   */
  discount() {
    event.preventDefault();

    let template = Template.instance();
    let order = template.order;

    return order.billing[0].invoice.discounts;
  }
});
