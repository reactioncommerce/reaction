/**
 * checkoutLoginCompleted
 * returns true if we've already past this stage,
 * or if the user is a guest but not anonymous
 */

Template.checkoutLogin.helpers({
  checkoutLoginCompleted: function () {
    const self = this;
    const guestUser = ReactionCore.hasPermission("guest", Meteor.user());
    const cart = ReactionCore.Collections.Cart.findOne();
    if (cart && cart.workflow) {
      const currentStatus = cart.workflow.status;
      const anonUser = Roles.userIsInRole("anonymous", Meteor.user(), ReactionCore.getShopId());

      if (currentStatus !== self.template && guestUser === true && anonUser === false) {
        return true;
      }
    }

    return false;
  }
});
