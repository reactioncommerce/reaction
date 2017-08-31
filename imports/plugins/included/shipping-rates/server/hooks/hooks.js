import { check } from "meteor/check";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

/**
 * getShippingRates - Returns a list of shipping rates based on the
 * items in a cart.
 * @param {Array} rates - an array of shipping rates. Might be non-empty
 * because some shipping rates have been fetched before.
 * @param {Object} cart - details about the purchase a user wants to make.
 * @return {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 */
function getShippingRates(rates, cart) {
  check(cart, CartSchema);
  const shops = [];
  const products = cart.items;

  let merchantShippingRates = false;
  const marketplaceSettings = Reaction.getMarketplaceSettings();
  if (marketplaceSettings && marketplaceSettings.enabled) {
    merchantShippingRates = marketplaceSettings.public.merchantShippingRates;
  }

  // TODO: Check to see if the merchantShippingRates flag is set in
  // marketplace and get rates from the correct shop.
  const pkgData = Packages.findOne({
    name: "reaction-shipping-rates",
    shopId: Reaction.getPrimaryShopId()
  });

  if (!pkgData || !cart.items || pkgData.settings.flatRates.enabled !== true) {
    return rates;
  }

  // default selector is primary shop
  let selector = {
    "shopId": Reaction.getPrimaryShopId(),
    "provider.enabled": true
  };

  if (merchantShippingRates) {
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
  }

  const shippingCollection = Shipping.find(selector);
  shippingCollection.forEach(function (doc) {
    const _results = [];
    for (const method of doc.methods) {
      if (!method.enabled) {
        continue;
      }
      if (!method.rate) {
        method.rate = 0;
      }
      if (!method.handling) {
        method.handling = 0;
      }
      // Store shipping provider here in order to have it available in shipmentMethod
      // for cart and order usage
      if (!method.carrier) {
        method.carrier = doc.provider.label;
      }
      const rate = method.rate + method.handling;
      _results.push(
        rates.push({
          carrier: doc.provider.label,
          method: method,
          rate: rate,
          shopId: doc.shopId
        })
      );
    }
    return _results;
  });

  Logger.debug("Flat rate onGetShippingRates", rates);
  return [rates, []];
}
// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
