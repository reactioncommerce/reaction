/*
* automatically start order processing on first view
*/

Template.coreOrderCreated.onRendered(function () {
  if (this.workflow) {
    if (this.workflow.status === "coreOrderCreated") {
      this.workflow.status = "coreOrderCreated";
      Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderCreated", this._id);
    }
  }
});
