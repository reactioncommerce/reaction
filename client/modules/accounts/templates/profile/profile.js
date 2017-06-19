import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/lib/api";
import * as Collections from "/lib/collections";
import OrderListContainer from "../../../../../imports/plugins/core/orders/client/containers/orderListContainer";

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
      const userOrders = Collections.Orders.find({
        userId: Meteor.userId()
      }, {
        sort: {
          createdAt: -1
        },
        limit: 25
      });
      return {
        component: OrderListContainer,
        userOrders
      };
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
