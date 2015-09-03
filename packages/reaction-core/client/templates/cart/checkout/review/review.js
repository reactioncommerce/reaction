/**
* review status
* trigger checkoutPayment step on template checkoutReview render
*/

Template.checkoutReview.onRendered(function () {
  Meteor.call("layout/pushWorkflow", "coreCartWorkflow", "checkoutReview");
});
