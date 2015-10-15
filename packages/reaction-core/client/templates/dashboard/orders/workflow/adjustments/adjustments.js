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

    let order = template.data;
    let discount = parseFloat(event.target.discount_amount.value) || 0;

    Meteor.call("orders/applyDiscount", order, discount, (error) => {
      if (error) {
        // Show error
      }
    });
  }
});
