Template.loginInline.events({
  'click .continue-guest': function(event, template) {
    event.preventDefault();
    Meteor.call("workflow/pushCartWorkflow", "coreCartWorkflow", 'checkoutLogin');
  }
});
