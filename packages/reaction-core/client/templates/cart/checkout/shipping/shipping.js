//
// These helpers can be used in general shipping packages
// or replaced, but are meant to be generalized in nature.
//
function cartShippingMethods(currentCart) {
  let cart = currentCart || ReactionCore.Collections.Cart.findOne();
  if (cart) {
    if (cart.shipping) {
      if (cart.shipping.shipmentQuotes) {
        return cart.shipping.shipmentQuotes;
      }
    }
  }
  return undefined;
}

function getShipmentMethod(currentCart) {
  let cart = currentCart || ReactionCore.Collections.Cart.findOne();
  if (cart) {
    if (cart.shipping) {
      if (cart.shipping.shipmentMethod) {
        return cart.shipping.shipmentMethod;
      }
    }
  }
  return undefined;
}

Template.coreCheckoutShipping.helpers({
  // retrieves current rates and updates shipping rates
  // in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: function () {
    let cart = ReactionCore.Collections.Cart.findOne();
    return cartShippingMethods(cart);
  },

  // helper to make sure there are some shipping providers
  shippingConfigured: function () {
    let exists = ReactionCore.Collections.Shipping.find({
      "methods.enabled": true
    }).count();
    return exists;
  },

  // helper to display currently selected shipmentMethod
  isSelected: function () {
    let self = this;
    let shipmentMethod = getShipmentMethod();
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
    let self = this;
    let cart = ReactionCore.Collections.Cart.findOne();

    try {
      Meteor.call("cart/setShipmentMethod", cart._id, self.method);
    } catch (error) {
      throw new Meteor.Error(error,
        "Cannot change methods while processing.");
    }
  }
});
