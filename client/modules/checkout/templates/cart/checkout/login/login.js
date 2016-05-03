import { Reaction } from "/client/modules/core";
import { Cart } from "/lib/collections";

/**
 * checkoutLoginCompleted
 * returns true if we've already past this stage,
 * or if the user is a guest but not anonymous
 */

Template.checkoutLogin.helpers({
  checkoutLoginCompleted: function () {
    const self = this;
    const cart = Cart.findOne();
    if (cart && cart.workflow) {
      const currentStatus = cart.workflow.status;
      const guestUser = Reaction.hasPermission("guest", Meteor.user());
      const anonUser = Roles.userIsInRole("anonymous", Meteor.user(), Reaction.getShopId());

      if (currentStatus !== self.template && guestUser === true && anonUser === false) {
        return true;
      }
    }
    return false;
  }
});
