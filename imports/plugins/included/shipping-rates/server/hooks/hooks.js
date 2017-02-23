import { check } from "meteor/check";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

// callback ran on getShippingRates hook
function getShippingRates(rates, cart) {
  check(cart, CartSchema);
  const shops = [];
  const products = cart.items;

  const pkgData = Packages.findOne({
    name: "reaction-shipping-rates",
    shopId: Reaction.getShopId()
  });

  if (!pkgData || !cart.items || pkgData.settings.flatRates.enabled !== true) {
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
  return rates;
}
// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
