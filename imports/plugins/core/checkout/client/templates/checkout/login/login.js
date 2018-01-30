import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";


/**
 * checkoutLoginCompleted
 * returns true if we've already past this stage,
 * or if the user is a guest but not anonymous
 */

Template.checkoutLogin.helpers({
  checkoutLoginCompleted() {
    const self = this;
    const cart = Cart.findOne();
    if (cart && cart.workflow) {
      const currentStatus = cart.workflow.status;
      const guestUser = Reaction.hasPermission("guest", Meteor.user());

      // when you click as "continue as guest" you ARE still anonymous.
      // you are only NOT anonymous if you sign up or have supply an email. Hence
      // we check only that the user is at least guest before moving to next step.
      // since sign up users can still have guest permission.
      if (currentStatus !== self.template && guestUser === true) {
        return true;
      }
    }
    return false;
  }
});
