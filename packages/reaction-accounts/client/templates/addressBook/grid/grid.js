/*
 * handles display of addressBook grid
 */
Template.addressBookGrid.helpers({
  selectedBilling: function () {
    let cart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    if (cart) {
      if (cart.billing) {
        if (cart.billing[0].address) {
          if (this._id === cart.billing[0].address._id) {
            return "active";
          }
        }
      }
    }
  },

  selectedShipping: function () {
    let cart = ReactionCore.Collections.Cart.findOne({
      userId: Meteor.userId()
    });

    if (cart) {
      if (cart.shipping) {
        if (cart.shipping[0].address) {
          if (this._id === cart.shipping[0].address._id) {
            return "active";
          }
        }
      }
    }
  },
  account: function () {
    return ReactionCore.Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
  }
});

/*
 * events
 */

Template.addressBookGrid.events({
  "click [data-event-action=selectShippingAddress]": function () {
    return Meteor.call("accounts/addressBookUpdate", this, Meteor.userId(),
      "isShippingDefault");
  },
  "click [data-event-action=selectBillingAddress]": function () {
    return Meteor.call("accounts/addressBookUpdate", this, Meteor.userId(),
      "isBillingDefault");
  }
});
