/**
* stateHelperTracking events
*
*/
Template.stateHelperTracking.events({
  "click #add-tracking-code": function(event, template) {
    var currentState, tracking;
    event.preventDefault();
    tracking = template.find("input[name=input-tracking-code]").value;
    if (!tracking) {
      Alerts.add("Tracking required to process order.", "danger", {
        autoHide: true
      });
      return false;
    }
    currentState = Orders.findOne(this._id).status;
    OrderWorkflow.current = currentState;
    OrderWorkflow[currentState](this, tracking);
    return OrderWorkflow.shipmentTracking(this, tracking);
  }
});
