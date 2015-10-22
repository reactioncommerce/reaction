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
    Meteor.call("orders/approvePayment", order, discount, (error) => {
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
  invoice() {
    event.preventDefault();

    let template = Template.instance();
    let order = template.order;

    return order.billing[0].invoice;
  },

  money(amount) {
    return ReactionCore.Currency.formatNumber(amount);
  },

  currencySymbol() {
    return ReactionCore.Locale.currency.symbol
  },

  order() {
    let template = Template.instance();
    return template.order;
  }
});
