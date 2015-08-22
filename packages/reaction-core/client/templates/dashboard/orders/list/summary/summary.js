/**
 * ordersListSummary helpers
 *
 * @param
 * @returns
 */
Template.ordersListSummary.helpers({
  invoice: function() {
    return this.payment.invoices[0];
  }
});
