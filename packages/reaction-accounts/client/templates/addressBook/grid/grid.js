/*
 * handles display of addressBook grid
 */
Template.addressBookGrid.helpers({
  selectedBilling: function() {
    var cart, ref, ref1, ref2, ref3;
    cart = ReactionCore.Collections.Cart.findOne();
    if (cart) {
      if (this._id === (cart != null ? (ref = cart.payment) != null ? (ref1 = ref.address) != null ? ref1._id : void 0 : void 0 : void 0)) {
        return "active";
      }
      if (this.isBillingDefault && !(cart != null ? (ref2 = cart.payment) != null ? (ref3 = ref2.address) != null ? ref3.fullName : void 0 : void 0 : void 0)) {
        return Meteor.call("setPaymentAddress", cart._id, this);
      }
    }
  },
  selectedShipping: function() {
    var cart, ref, ref1, ref2;
    cart = ReactionCore.Collections.Cart.findOne();
    if (cart) {
      if (this._id === ((ref = cart.shipping.address) != null ? ref._id : void 0)) {
        return "active";
      }
      if (this.isShippingDefault && !(cart != null ? (ref1 = cart.shipping) != null ? (ref2 = ref1.address) != null ? ref2.fullName : void 0 : void 0 : void 0)) {
        return Meteor.call("setShipmentAddress", cart._id, this);
      }
    }
  },
  account: function() {
    return ReactionCore.Collections.Accounts.findOne({
      userId: Meteor.userId()
    });
  }
});


/*
 * events
 */

Template.addressBookGrid.events({
  'click .address-ship-to': function(event, template) {
    cart = ReactionCore.Collections.Cart.findOne();
    return Meteor.call("setShipmentAddress", cart._id, this);
  },
  'click .address-bill-to': function(event, template) {
    cart = ReactionCore.Collections.Cart.findOne();
    return Meteor.call("setPaymentAddress", cart._id, this);
  }
});
