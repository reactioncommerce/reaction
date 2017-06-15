import { Template } from "meteor/templating";

/**
 * ordersListSummary helpers
 *
 * @returns paymentInvoice
 */
Template.ordersListSummary.helpers({
  invoice() {
    return this.invoice;
  },
  itemQty() {
    const data = Template.instance().data;
    return data.count;
  }
});
