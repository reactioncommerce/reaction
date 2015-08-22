/**
* stateHelperShipped events
*
*/
Template.stateHelperShipped.events({
  'click .btn': function() {
    return OrderWorkflow.orderCompleted(this);
  }
});
