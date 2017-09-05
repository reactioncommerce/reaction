import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { ReactiveVar } from "meteor/reactive-var";
import { Reaction } from "/client/api";
import { i18next } from  "/client/api";
import * as Collections from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";


/**
 * onCreated: Account Profile View
 */
Template.accountProfile.onCreated(() => {
  const template = Template.instance();

  template.userHasPassword = ReactiveVar(false);

  Meteor.call("accounts/currentUserHasPassword", (error, result) => {
    template.userHasPassword.set(result);
  });
  // hide actionView if open, doesn't relate to profile page
  Reaction.hideActionView();
});

/**
 * Helpers: Account Profile View
 */
Template.accountProfile.helpers({

  UpdateEmail() {
    return {
      component: Components.UpdateEmail
    };
  },

  ReactionAvatar() {
    return {
      component: Components.ReactionAvatar
    };
  },

  /**
   * User has password
   * @return {Boolean} return true if the current user has a password, false otherwise
   */
  userHasPassword() {
    return Template.instance().userHasPassword.get();
  },

  /**
   * User's order history
   * @return {Array|null} an array of available orders for the user
   */
  userOrders() {
    const orderSub = Meteor.subscribe("AccountOrders", Meteor.userId());
    if (orderSub.ready()) {
      return Collections.Orders.find({
        userId: Meteor.userId()
      }, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
    }
  },

  /**
   * User's account profile
   * @return {Object} account profile
   */
  account() {
    return Collections.Accounts.findOne();
  },

  /**
   * User's display name
   * @return {String} display name
   */
  displayName() {
    const userId = Meteor.userId() || {};
    const user = Collections.Accounts.findOne(userId);

    if (user) {
      if (user.name) {
        return user.name;
      } else if (user.username) {
        return user.username;
      } else if (user.profile && user.profile.name) {
        return user.profile.name;
      }
    }

    if (Roles.userIsInRole(user._id || user.userId, "account/profile",
      Reaction.getShopId())) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  },

  /**
   * Returns the address book default view
   * @return {String} "addressBookGrid" || "addressBookAdd"
   */
  addressBookView: function () {
    const account = Collections.Accounts.findOne();
    if (account.profile) {
      return "addressBookGrid";
    }
    return "addressBookAdd";
  },

  isMarketplaceGuest: function () {
    return (Reaction.hasMarketplaceAccess("guest") && !Reaction.hasAdminAccess());
  },

  isMarketplaceSeller: function () {
    return (Reaction.hasMarketplaceAccess() && !Reaction.hasOwnerAccess());
  }
});
