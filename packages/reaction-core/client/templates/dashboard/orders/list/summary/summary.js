/**
 * ordersListSummary helpers
 *
 * @returns paymentInvoice
 */
Template.ordersListSummary.helpers({
  invoice: function () {
    return this.billing[0].invoices;
  }
});
