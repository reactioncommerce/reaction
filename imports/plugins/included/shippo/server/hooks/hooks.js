import { Meteor } from "meteor/meteor";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";

// callback ran on getShippingRates hook
function getShippingRates(rates, cart) {
  const shops = [];
  const products = cart.items;

  const pkgData = Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getShopId()
  });

  // must have cart items and package enabled to calculate shipping
  if (!pkgData || !cart.items || pkgData.settings.shippo.enabled !== true) {
    return rates;
  }

  // default selector is current shop
  let selector = {
    "shopId": Reaction.getShopId(),
    "provider.enabled": true
  };

  // create an array of shops, allowing
  // the cart to have products from multiple shops
  for (const product of products) {
    if (product.shopId) {
      shops.push(product.shopId);
    }
  }
  // if we have multiple shops in cart
  if ((shops !== null ? shops.length : void 0) > 0) {
    selector = {
      "shopId": {
        $in: shops
      },
      "provider.enabled": true
    };
  }

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
      const shippoRates = Meteor.call("shippo/getShippingRatesForCart", cart._id, shippoDocs);
      rates.push(...shippoRates);
    }
  }

  Logger.debug("Shippo onGetShippingRates", rates);
  return rates;
}

// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
