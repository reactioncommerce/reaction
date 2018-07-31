import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import getCart from "/imports/plugins/core/cart/client/util/getCart";

Template.checkoutLogin.helpers({
  /**
   * @returns {Boolean} true if it's an account cart or already has an email
   */
  checkoutLoginCompleted() {
    const { cart } = getCart();
    if (!cart) return false;

    if (cart && cart.workflow) {
      const currentStatus = cart.workflow.status;
      const guestUser = Reaction.hasPermission("guest", Meteor.user());

      // when you click as "continue as guest" you ARE still anonymous.
      // you are only NOT anonymous if you sign up or have supply an email. Hence
      // we check only that the user is at least guest before moving to next step.
      // since sign up users can still have guest permission.
      if (currentStatus !== this.template && guestUser === true) {
        return true;
      }
    }

    return false;
  }
});
