/**
 * ordersListSummary helpers
 *
 * @returns paymentInvoice
 */
Template.ordersListSummary.helpers({
  invoice: function() {
    return this.payment.invoices[0];
  }
});
