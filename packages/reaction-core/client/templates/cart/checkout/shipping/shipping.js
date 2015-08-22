//
// These helpers can be used in general shipping packages
// or replaced, but are meant to be generalized in nature.
//

var cart = ReactionCore.Collections.Cart.findOne();

var cartShippingMethods = function (cart) {

  var shipping;

  if (typeof cart !== "undefined" && cart !== null) {
    if ((shipping = cart.shipping) != null) {
      return shipping.shipmentQuotes;
    }
  }

  return null;
}

var getShipmentMethod = function (cart) {

  var cart = cart || ReactionCore.Collections.Cart.findOne();
  var shipping;

  if (typeof cart !== "undefined" && cart !== null) {
    if ((shipping = cart.shipping)) {
      return shipping.shipmentMethod;
    }
  }

  return null;
}

Template.coreCheckoutShipping.helpers({
  // retrieves current rates and updates shipping rates
  // in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: function () {
    var cart = ReactionCore.Collections.Cart.findOne();
    return cartShippingMethods(cart);
  },

  // helper to make sure there are some shipping providers
  shippingConfigured: function () {
    var exists = ReactionCore.Collections.Shipping.find({'methods.enabled': true}).count();
    return exists;
  },

  // helper to display currently selected shipmentMethod
  isSelected: function (cart) {

    var self = this;
    var shipmentMethod = getShipmentMethod();

    // if there is already a selected method, set active
    if (_.isEqual(self.method, shipmentMethod)) {
      return "active";
    }

    return;

  }

});

//
// Set and store cart shipmentMethod
// this copies from shipmentMethods (retrieved rates)
// to shipmentMethod (selected rate)
//
Template.coreCheckoutShipping.events({

  "click .list-group-item": function (event, template) {

    event.preventDefault();
    event.stopPropagation();

    var self = this;
    var cart = ReactionCore.Collections.Cart.findOne();

    try {
      Meteor.call("setShipmentMethod", cart._id, self.method);
    } catch (error) {
      console.info("Cannot change methods while processing.");
      return
    }

  }
});
