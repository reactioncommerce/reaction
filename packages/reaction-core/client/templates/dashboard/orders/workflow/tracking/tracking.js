/**
 * stateHelperTracking events
 *
 */
Template.coreOrderCreated.events({
  "click #add-tracking-code": function (event, template) {
    var currentState, tracking;
    event.preventDefault();

    if (!this._id) {
      throw new Meteor.Error("Failed", "Missing tracking order.")
    }

    tracking = template.find("input[name=input-tracking-code]").value;
    if (!tracking) {
      Alerts.add("Tracking required to process order.", "danger", {
        autoHide: true
      });
      return false;
    }
    Meteor.call("shipmentTracking", this, tracking);
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
  }
});
