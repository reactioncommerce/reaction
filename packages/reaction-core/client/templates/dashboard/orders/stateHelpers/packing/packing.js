/**
* stateHelperPacking events
*
*/
Template.stateHelperPacking.events({
  'click .btn': function() {
    return OrderWorkflow.shipmentPacking(this);
  }
});
