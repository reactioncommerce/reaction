import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveDict } from "meteor/reactive-dict";
import { Reaction } from "/client/api";
import { Cart } from "/lib/collections";

/**
 * cartShippingQuotes - returns a list of all the shipping costs/quotations
 * of each available shipping carrier like UPS, Fedex etc.
 * @param {Object} currentCart - The current cart that's about
 * to be checked out.
 * @returns {Array} - an array of the quotations of multiple shipping
 * carriers.
 */
function cartShippingQuotes(currentCart) {
  const cart = currentCart || Cart.findOne();
  const shipmentQuotes = [];
  const primaryShopId = Reaction.getPrimaryShopId();
  if (cart) {
    if (cart.shipping) {
      for (const shipping of cart.shipping) {
        if (shipping.shipmentQuotes) {
          for (const quote of shipping.shipmentQuotes) {
            if (shipping.shopId === primaryShopId) {
              if (quote.carrier === "Flat Rate" || quote.requestStatus !== "error") {
                shipmentQuotes.push(quote);
              }
            }
          }
        }
      }
    }
  }

  return shipmentQuotes;
}

function shippingMethodsQueryStatus(currentCart) {
  const cart = currentCart || Cart.findOne();
  let queryStatus;
  let failingShippingProvider;

  if (cart) {
    if (cart.shipping) {
      for (const shipping of cart.shipping) {
        const quotesQueryStatus = shipping.shipmentQuotesQueryStatus;
        if (quotesQueryStatus) {
          queryStatus = quotesQueryStatus.requestStatus;
        }
        if (queryStatus === "error") {
          failingShippingProvider = quotesQueryStatus.shippingProvider;
        }
      }
    }
  }

  return [queryStatus, failingShippingProvider];
}

/**
 * cartShipmentMethods - gets current shipment methods.
 * @return {Array} - Returns multiple methods if more than one
 * carrier has been chosen.
 */
function cartShipmentMethods() {
  const cart = Cart.findOne();
  const shipmentMethods = [];
  const primaryShopId = Reaction.getPrimaryShopId();
  if (cart) {
    if (cart.shipping) {
      for (const shipping of cart.shipping) {
        if (shipping.shipmentMethod && shipping.shopId === primaryShopId) {
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
    enabled: true,
    shopId: Reaction.getPrimaryShopId()
  });
  for (const app of apps) {
    if (app.enabled === true) enabledShippingArr.push(app);
  }
  return enabledShippingArr;
}

Template.coreCheckoutShipping.onCreated(function () {
  this.autorun(() => {
    this.subscribe("Shipping");
  });

  this.state = new ReactiveDict();
  this.state.setDefault({
    isLoadingShippingMethods: true
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

      // isLoadingShippingMethods is updated here because, when this template
      // reacts to a change in data, this method is called before hasShippingMethods().
      const isLoadingShippingMethods = shippingMethodsQueryStatus()[0] === "pending";
      instance.state.set("isLoadingShippingMethods", isLoadingShippingMethods);

      const shippingQuotes = cartShippingQuotes(cart);
      return shippingQuotes;
    }
  },

  hasShippingMethods() {
    const instance = Template.instance();
    const isLoadingShippingMethods = instance.state.get("isLoadingShippingMethods");
    if (isLoadingShippingMethods) {
      return true;
    }

    // Useful for when shipping methods are enabled, but querying them fails
    // due to internet connection issues.
    const quotesQueryStatus = shippingMethodsQueryStatus();
    const didAllQueriesFail =
      quotesQueryStatus[0] === "error" && quotesQueryStatus[1] === "all";
    if (didAllQueriesFail) {
      return false;
    }

    const hasEnabledShippingProviders = enabledShipping().length > 0;
    if (hasEnabledShippingProviders) {
      return true;
    }

    return false;
  },

  // helper to display currently selected shipmentMethod
  isSelected: function () {
    const self = this;
    const shipmentMethods = cartShipmentMethods();

    for (const method of shipmentMethods) {
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
  },

  /**
   * Template helper that checks to see if the user has permissions for the shop
   * responsible for shipping rates. This is the primary shop unless
   * `merchantShippingRates` is enabled in marketplace
   * @method isAdmin
   * @return {Boolean} true if the user has admin access, otherwise false
   */
  isAdmin() {
    const marketplaceSettings = Reaction.marketplace;
    if (marketplaceSettings && marketplaceSettings.merchantShippingRates) {
      Reaction.hasAdminAccess();
    }
    return Reaction.hasAdminAccess(Reaction.getPrimaryShopId());
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
