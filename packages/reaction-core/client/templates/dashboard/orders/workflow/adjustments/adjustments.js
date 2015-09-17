/**
 * coreOrderAdjustments events
 *
 */
Template.coreOrderAdjustments.events({
  'click .btn': function () {
    Meteor.call("workflow/pushOrderWorkflow", "coreOrderWorkflow", "coreOrderAdjustments", this._id);
  }
});
