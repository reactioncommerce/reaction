import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Reaction } from "/client/api";
import { i18next } from  "/client/api";
import * as Collections from "/lib/collections";
import { Components } from "@reactioncommerce/reaction-components";


function isOwnerOfProfile() {
  const targetUserId = Reaction.Router.getQueryParam("userId");
  const loggedInUserId = Meteor.userId();
  return targetUserId === undefined || targetUserId === loggedInUserId;
}

function getTargetAccount() {
  const targetUserId = Reaction.Router.getQueryParam("userId") || Meteor.userId();
  const account = Collections.Accounts.findOne(targetUserId);

  return account;
}

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
  doesUserExist() {
    const targetUserId = Reaction.Router.getQueryParam("userId");
    if (!targetUserId) {
      // If userId isn't in this route's query parameters, then a user 
      // is viewing his/her own profile.
      return true;
    }
    const targetUser = Collections.Accounts.findOne(targetUserId);
    return targetUser !== undefined;
  },

  isOwnerOfProfile() {
    return isOwnerOfProfile();
  },

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
    const targetUserId = Reaction.Router.getQueryParam("userId") || Meteor.userId();
    const orderSub = Meteor.subscribe("AccountOrders", targetUserId);
    if (orderSub.ready()) {
      return Collections.Orders.find({
        userId: targetUserId
      }, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
    }
  },

  /**
   * User's display name
   * @return {String} display name
   */
  displayName() {
    if (Reaction.Subscriptions && Reaction.Subscriptions.Account && Reaction.Subscriptions.Account.ready()) {
      const account = getTargetAccount();

      if (account) {
        if (account.name) {
          return account.name;
        } else if (account.username) {
          return account.username;
        } else if (account.profile && account.profile.name) {
          return account.profile.name;
        }
      }
    }

    if (Reaction.hasPermission("account/profile")) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  },

  /**
   * Display user's email
   * @return {String} - email of target user
   */
  displayEmail() {
    if (Reaction.Subscriptions && Reaction.Subscriptions.Account && Reaction.Subscriptions.Account.ready()) {
      const account = getTargetAccount();

      if (account && account.emails && account.emails[0]) {
        return account.emails[0].address;
      }
    }
  },

  showMerchantSignup: function () {
    if (Reaction.Subscriptions && Reaction.Subscriptions.Account && Reaction.Subscriptions.Account.ready()) {
      const account = Collections.Accounts.findOne({ _id: Meteor.userId() });
      const marketplaceEnabled = Reaction.marketplace && Reaction.marketplace.enabled === true;
      const allowMerchantSignup = Reaction.marketplace && Reaction.marketplace.allowMerchantSignup === true;
      // A user has the primaryShopId until a shop is created for them.
      const userHasShop = account.shopId !== Reaction.getPrimaryShopId();
      return marketplaceEnabled && allowMerchantSignup && !userHasShop;
    }
    return false;
  }
});
