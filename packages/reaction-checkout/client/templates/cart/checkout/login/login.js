/**
 * checkoutLoginCompleted
 * returns true if we've already past this stage,
 * or if the user is a guest but not anonymous
 */

Template.checkoutLogin.helpers({
  checkoutLoginCompleted: function () {
    const self = this;
    let guestUser = ReactionCore.hasPermission("guest", Meteor.user());
    const cart = ReactionCore.Collections.Cart.findOne();
    if (cart && cart.workflow) {
      let currentStatus = cart.workflow.status;
      let anonUser = Roles.userIsInRole("anonymous", Meteor.user(),
        ReactionCore.getShopId());

      if (currentStatus !== self.template && guestUser === true &&
        anonUser === false) {
        return true;
      }
    }

    return false;
  }
});
