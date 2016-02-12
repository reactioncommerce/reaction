Template.printInvoice.events({
  'click .print-invoice': function () {
    let orderId = event.target.dataset.orderId;
    let userId = Meteor.userId();
    Meteor.call('advancedFulfillment/printInvoice', orderId, userId);
  }
});
