import _ from "lodash";
import { Shops, Cart, Shipping } from "/lib/collections";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";

import "./shippo.html";



//Template.flatRateCheckoutShipping.inheritsHelpersFrom("coreCheckoutShipping");
//Template.flatRateCheckoutShipping.inheritsEventsFrom("coreCheckoutShipping");




//
// These helpers can be used in general shipping packages
// cartShippingMethods to get current shipment methods
// until we handle multiple methods, we just use the first
function cartShippingMethods(currentCart) {
  const cart = currentCart || Cart.findOne();
  if (cart) {
    if (cart.shipping) {
      if (cart.shipping[0].shipmentQuotes) {
        return cart.shipping[0].shipmentQuotes;
      }
    }
  }
  return undefined;
}
// getShipmentMethod to get current shipment method
// until we handle multiple methods, we just use the first
function getShipmentMethod(currentCart) {
  const cart = currentCart || Cart.findOne();
  if (cart) {
    if (cart.shipping) {
      if (cart.shipping[0].shipmentMethod) {
        return cart.shipping[0].shipmentMethod;
      }
    }
  }
  return undefined;
}

// // Temporarily get only first product from cart
// function getBillingAddress() {
//   const cart = Cart.findOne();
//   if (cart && cart.billing && cart.billing[0] && cart.billing[0].address) {
//     return cart.billing[0].address;
//   }
// }
//
// // Temporarily get only first product from cart
// function getShopAddress() {
//   const cart = Cart.findOne();
//   if (cart && cart.billing && cart.billing[0] && cart.billing[0].address) {
//     return cart.billing[0].address;
//   }
// }



Template.shippoCheckoutShipping.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });
});

Template.shippoCheckoutShipping.helpers({
  // retrieves current rates and updates shipping rates
  // in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: function () {
    const cart = Cart.findOne();
    return cartShippingMethods(cart);
  },

  shippoMethods: function () {
    const cart = Cart.findOne();
    Meteor.call("shippo/getCarrierRates", cart);
  },

  // helper to make sure there are some shipping providers
  shippingConfigured: function () {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      return Shipping.find({
        "methods.enabled": true
      }).count();
    }
  },

  // helper to display currently selected shipmentMethod
  isSelected: function () {
    const self = this;
    const shipmentMethod = getShipmentMethod();
    // if there is already a selected method, set active
    if (_.isEqual(self.method, shipmentMethod)) {
      return "active";
    }
    return null;
  }
});

//
// Set and store cart shipmentMethod
// this copies from shipmentMethods (retrieved rates)
// to shipmentMethod (selected rate)
//
Template.coreCheckoutShipping.events({
  "click .list-group-item": function (event) {
    event.preventDefault();
    event.stopPropagation();
    const self = this;
    const cart = Cart.findOne();

    try {
      Meteor.call("cart/setShipmentMethod", cart._id, self.method);
    } catch (error) {
      throw new Meteor.Error(error,
        "Cannot change methods while processing.");
    }
  }
});
