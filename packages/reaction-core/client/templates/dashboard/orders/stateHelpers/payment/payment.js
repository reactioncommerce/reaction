/**
* stateHelperPayment events
*
*/
Template.stateHelperPayment.events({
  'click .btn': function() {
    return OrderWorkflow.shipmentShipped(this);
  }
});
