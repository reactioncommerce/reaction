import { Meteor } from "meteor/meteor";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";

// callback ran on getShippingRates hook
function getShippingRates(previousQueryResults, cart) {
  const [rates, retrialTargets] = previousQueryResults;

  const pkgData = Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getPrimaryShopId()
  });

  // must have cart items and package enabled to calculate shipping
  if (!pkgData || !cart.items || pkgData.settings.shippo.enabled !== true) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "shippo",
      message: "Error. The Shippo package may be uninstalled or disabled, or your cart is empty."
    };
    // There's no need for a retry in this case.
    rates.push(errorDetails);
    return [rates, retrialTargets];
  }

  // This cart possibly contains items from multiple shops, so get the
  // IDs of those shops and use those in the DB query.
  const products = cart.items;
  const primaryShopId = Reaction.getPrimaryShopId();
  const shopIds = [primaryShopId];
  for (const product of products) {
    if (product.shopId && product.shopId !== primaryShopId) {
      shopIds.push(product.shopId);
    }
  }
  const selector = {
    "shopId": {
      $in: shopIds
    },
    "provider.enabled": true
  };

  const shippingCollection = Shipping.find(selector);
  const shippoDocs = {};
  if (shippingCollection) {
    shippingCollection.forEach(function (doc) {
      // If provider is from Shippo, put it in an object to get rates dynamically(shippoApi) for all of them after.
      if (doc.provider.shippoProvider) {
        shippoDocs[doc.provider.shippoProvider.carrierAccountId] = doc;
      }
    });

    //  Get shippingRates from Shippo
    if (Object.keys(shippoDocs).length > 0) {
      const targets = retrialTargets.slice();
      const shippingRatesInfo =
        Meteor.call("shippo/getShippingRatesForCart", cart._id, shippoDocs, targets);
      const [shippoRates, singleRetrialTarget] = shippingRatesInfo;
      rates.push(...shippoRates);
      retrialTargets.push(...singleRetrialTarget);
    }
  }

  Logger.debug("Shippo onGetShippingRates", [rates, retrialTargets]);
  return [rates, retrialTargets];
}

// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
