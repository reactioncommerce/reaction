import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
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
   * User's display name
   * @return {String} display name
   */
  displayName() {
    const account = Collections.Accounts.findOne(Meteor.userId());

    if (account) {
      if (account.name) {
        return account.name;
      } else if (account.username) {
        return account.username;
      } else if (account.profile && account.profile.name) {
        return account.profile.name;
      }
    }

    if (Reaction.hasPermission("account/profile")) {
      return i18next.t("accountsUI.guest", { defaultValue: "Guest" });
    }
  },

  showMerchantSignup: function () {
    const account = Collections.Accounts.findOne({ _id: Meteor.userId() });
    const marketplaceEnabled = Reaction.marketplace && Reaction.marketplace.enabled === true;
    const allowMerchantSignup = Reaction.marketplace && Reaction.marketplace.allowMerchantSignup === true;
    const userHasShop = account.shopId !== Reaction.getPrimaryShopId();
    return marketplaceEnabled && allowMerchantSignup && !userHasShop;
  }
});
