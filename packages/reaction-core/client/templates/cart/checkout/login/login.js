
/**
* checkoutLoginCompleted
* returns true if we've already past this stage,
* or if the user is a guest but not anonymous
*/


Template.checkoutLogin.helpers({
  checkoutLoginCompleted: function (options) {
    self = this;

    var guestUser = ReactionCore.hasPermission("guest", Meteor.user());
    var anonUser = Roles.userIsInRole("anonymous", Meteor.user(), ReactionCore.getShopId());
    var currentStatus = ReactionCore.Collections.Cart.findOne().workflow.status;

    if (currentStatus != self.workflow && guestUser === true && anonUser === false) {
      return true;
    } else {
      return false;
    }
  }
});


/**
* review status
* trigger checkoutPayment step on template render
*/

/*Template.checkoutLogin.onRendered(function () {
    Meteor.call("layout/pushWorkflow", "coreCartWorkflow", "checkoutLogin");
});*/
