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
  checkoutLoginCompleted: function () {
    const self = this;
    const cart = Cart.findOne();
    if (cart && cart.workflow) {
      const currentStatus = cart.workflow.status;
      const guestUser = Reaction.hasPermission("guest", Meteor.userId(), Reaction.getShopId());
      const anonUser = Reaction.hasPermission("anonymous", Meteor.userId(), Reaction.getShopId());

      // ensure that user is not anonymous
      if (anonUser === true && guestUser === false) {
        return false;
      }

      if (currentStatus !== self.template && guestUser === true) {
        return true;
      }
    }
    return false;
  }
});
