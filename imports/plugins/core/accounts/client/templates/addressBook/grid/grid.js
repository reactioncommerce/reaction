import * as Collections from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

/*
 * handles display of addressBook grid
 */
Template.addressBookGrid.helpers({
  selectedBilling() {
    const cart = Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    if (cart) {
      if (cart.billing) {
        if (cart.billing[0].address) {
          if (this._id === cart.billing[0].address._id) {
            return "active";
          }
        }
      } else if (this.isBillingDefault) { // if this is a first checkout review, we need to push default
        // billing address to cart
        Meteor.call("cart/setPaymentAddress", cart._id, this);
      }
    }
  },

  selectedShipping() {
    const cart = Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    if (cart) {
      if (cart.shipping) {
        if (cart.shipping[0].address) {
          if (this._id === cart.shipping[0].address._id) {
            return "active";
          }
        }
      } else if (this.isShippingDefault) { // if this is a first checkout review, we need to push default
        // shipping address to cart
        Meteor.call("cart/setShipmentAddress", cart._id, this);
      }
    }
  },
  account() {
    return Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
  }
});

/*
 * events
 */

Template.addressBookGrid.events({
  "click [data-event-action=selectShippingAddress]"() {
  // update address(make it default) only if wasn't already
    if (!this.isShippingDefault) {
      return Meteor.call("accounts/addressBookUpdate", this, null, "isShippingDefault");
    }
  },
  "click [data-event-action=selectBillingAddress]"() {
    // update address(make it default) only if wasn't already
    if (!this.isBillingDefault) {
      return Meteor.call("accounts/addressBookUpdate", this, null, "isBillingDefault");
    }
  }
});
