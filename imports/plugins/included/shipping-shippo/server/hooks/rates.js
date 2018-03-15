import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";

// callback ran on getShippingRates hook
function getShippingRates(previousQueryResults, cart) {
  const marketplaceSettings = Reaction.getMarketplaceSettings();
  const merchantShippingRates = _.get(marketplaceSettings, "public.merchantShippingRates", false);

  if (merchantShippingRates) {
    Logger.fatal("Multiple shipping providers is currently not implemented");
    throw new Meteor.Error("not-implemented", "Multiple shipping providers is currently not implemented");
  }

  const pkgData = Packages.findOne({
    name: "reaction-shippo",
    shopId: Reaction.getPrimaryShopId()
  });

  const [rates, retrialTargets] = previousQueryResults;
  const products = cart.items;

  // must have cart items and package enabled to calculate shipping
  if (!pkgData || !products || pkgData.settings.shippo.enabled !== true) {
    return [rates, retrialTargets];
  }

  // if we don't have merchant shipping rates enabled, only grab rates from primary shop
  const shops = [];
  if (!merchantShippingRates) {
    shops.push(Reaction.getPrimaryShopId());
  } else {
    // create an array of shops, allowing
    // the cart to have products from multiple shops
    for (const product of products) {
      if (product.shopId) {
        shops.push(product.shopId);
      }
    }
  }

  const shippoDocs = {};
  Shipping.find({
    "shopId": { $in: shops },
    "provider.enabled": true
  }).forEach((doc) => {
    // If provider is from Shippo, put it in an object to get rates dynamically(shippoApi) for all of them after.
    if (doc.provider.shippoProvider) {
      shippoDocs[doc.provider.shippoProvider.carrierAccountId] = doc;
    }
  });

  // Get shippingRates from Shippo
  if (Object.keys(shippoDocs).length > 0) {
    const targets = retrialTargets.slice();
    const shippingRatesInfo =
      Meteor.call("shippo/getShippingRatesForCart", cart._id, shippoDocs, targets);
    const [shippoRates, singleRetrialTarget] = shippingRatesInfo;
    rates.push(...shippoRates);
    retrialTargets.push(...singleRetrialTarget);
  }

  Logger.debug("Shippo onGetShippingRates", [rates, retrialTargets]);
  return [rates, retrialTargets];
}

// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
