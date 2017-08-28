import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
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

      // when user is guest, they are also anonymous.
      if (currentStatus !== self.template && guestUser === true && anonUser === true) {
        return true;
      }
    }
    return false;
  }
});
