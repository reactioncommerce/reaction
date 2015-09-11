Template.loginInline.events({
  'click .continue-guest': function(event, template) {
    event.preventDefault();
    Meteor.call("layout/pushWorkflow", "coreCartWorkflow", 'checkoutLogin');
  }
});
