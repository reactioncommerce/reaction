import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";

// cartShippingQuotes
// returns multiple methods
function cartShippingQuotes(currentCart) {
  const cart = currentCart || Cart.findOne();
  const shipmentQuotes = [];

  if (cart) {
    if (cart.shipping) {
      for (const shipping of cart.shipping) {
        if (shipping.shipmentQuotes) {
          for (quote of shipping.shipmentQuotes) {
            shipmentQuotes.push(quote);
          }
        }
      }
    }
  }
  return shipmentQuotes;
}
// cartShipmentMethods to get current shipment method
// this returns multiple methods, if more than one carrier
// has been chosen
function cartShipmentMethods(currentCart) {
  const cart = currentCart || Cart.findOne();
  const shipmentMethods = [];

  if (cart) {
    if (cart.shipping) {
      for (const shipping of cart.shipping) {
        if (shipping.shipmentMethod) {
          shipmentMethods.push(shipping.shipmentMethod);
        }
      }
    }
  }
  return shipmentMethods;
}

function enabledShipping() {
  const enabledShippingArr = [];
  const apps = Reaction.Apps({
    provides: "shippingSettings",
    enabled: true
  });
  for (app of apps) {
    if (app.enabled === true) enabledShippingArr.push(app);
  }
  return enabledShippingArr;
}

// ensure new quotes are
Template.coreCheckoutShipping.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });

  const enabled = enabledShipping();
  const isEnabled = enabled.length;
  const shippingOpts = {
    provides: "settings",
    name: "settings/shipping",
    template: "shippingSettings"
  };

  // If shipping not set, show shipping settings dashboard
  if (!isEnabled) {
    Reaction.showActionView(shippingOpts);
  }
});

Template.coreCheckoutShipping.helpers({
  // retrieves current rates and updates shipping rates
  // in the users cart collection (historical, and prevents repeated rate lookup)
  shipmentQuotes: function () {
    const instance = Template.instance();
    if (instance.subscriptionsReady()) {
      const cart = Cart.findOne();
      return cartShippingQuotes(cart);
    }
  },
  // helper to display currently selected shipmentMethod
  isSelected: function () {
    const self = this;
    const shipmentMethods = cartShipmentMethods();

    for (method of shipmentMethods) {
      // if there is already a selected method, set active
      if (_.isEqual(self.method, method)) {
        return "active";
      }
    }
    return null;
  },

  isReady() {
    const instance = Template.instance();
    const isReady = instance.subscriptionsReady();

    if (Reaction.Subscriptions.Cart.ready()) {
      if (isReady) {
        return true;
      }
    }

    return false;
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
  },
  "click [data-event-action=configure-shipping]"(event) {
    event.preventDefault();

    const dashboardRegistryEntry = Reaction.Apps({ name: "reaction-dashboard", provides: "shortcut" });
    const shippingRegistryEntry = Reaction.Apps({ name: "reaction-shipping", provides: "settings" });

    Reaction.showActionView([
      dashboardRegistryEntry[0],
      shippingRegistryEntry[0]
    ]);
  }
});
