import { Meteor } from "meteor/meteor";
import { Shipping, Packages } from "/lib/collections";
import { Logger, Reaction, Hooks } from "/server/api";
import { Cart as CartSchema } from "/lib/collections/schemas";

/**
 * getShippingRates - Returns a list of shipping rates based on the
 * items in a cart.
 * @param {Array} previousQueryResults - an array of shipping rates and
 * info about failed calls to the APIs of some shipping methods providers
 * e.g Shippo.
 * @param {Object} cart - details about the purchase a user wants to make.
 * @return {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 */
function getShippingRates(previousQueryResults, cart) {
  CartSchema.validate(cart);
  const [rates, retrialTargets] = previousQueryResults;
  const shops = [];
  const products = cart.items;

  const currentMethodInfo = {
    packageName: "flat-rate-shipping",
    fileName: "hooks.js"
  };
  if (retrialTargets.length > 0) {
    const isNotAmongFailedRequests = retrialTargets.every((target) =>
      target.packageName !== currentMethodInfo.packageName &&
      target.fileName !== currentMethodInfo.fileName);
    if (isNotAmongFailedRequests) {
      return previousQueryResults;
    }
  }

  // Verify that we have shipping records
  if (!cart.shipping || !cart.shipping.length) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "this cart is missing shipping records"
    };
    return [[errorDetails], []];
  }

  // Verify that we have a valid address to work with
  let shippingErrorDetails;
  if (cart.shipping.find((shippingRecord) => !shippingRecord.address)) {
    shippingErrorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "The address property on one or more shipping records are incomplete"
    };
    return [[shippingErrorDetails], []];
  }

  // Validate that we have valid items to work with. We should never get here since we filter for this
  // at the cart level
  if (!cart.items || !cart.items.length) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "this cart has no items"
    };
    return [[errorDetails], []];
  }

  let merchantShippingRates = false;
  const marketplaceSettings = Reaction.getMarketplaceSettings();
  if (marketplaceSettings && marketplaceSettings.enabled) {
    ({ merchantShippingRates } = marketplaceSettings.public);
  }

  let pkgData;
  if (merchantShippingRates) {
    // TODO this needs to be rewritten to handle getting rates from each shops that's represented on the order
    Logger.fatal("Multiple shipping providers is currently not supported");
    throw new Meteor.Error("not-implemented", "Multiple shipping providers is currently not supported");
  } else {
    pkgData = Packages.findOne({
      name: "reaction-shipping-rates",
      shopId: Reaction.getPrimaryShopId()
    });
  }


  if (!pkgData || !cart.items || pkgData.settings.flatRates.enabled !== true) {
    return [rates, retrialTargets];
  }

  // default selector is primary shop
  let selector = {
    "shopId": Reaction.getPrimaryShopId(),
    "provider.enabled": true
  };

  // Get rates from shops if merchantShippingRates is enabled
  // Otherwise just get them from the primaryShop
  if (merchantShippingRates) {
    // create an array of shops, allowing
    // the cart to have products from multiple shops
    for (const product of products) {
      if (product.shopId) {
        shops.push(product.shopId);
      }
    }
    // if we have multiple shops in cart
    if ((shops !== null ? shops.length : undefined) > 0) {
      selector = {
        "shopId": {
          $in: shops
        },
        "provider.enabled": true
      };
    }
  }

  const shippingCollection = Shipping.find(selector);
  const initialNumOfRates = rates.length;
  shippingCollection.forEach((doc) => {
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
      _results.push(rates.push({
        carrier: doc.provider.label,
        method,
        rate,
        shopId: doc.shopId
      }));
    }
    return _results;
  });

  if (rates.length === initialNumOfRates) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "Flat rate shipping did not return any shipping methods."
    };
    rates.push(errorDetails);
    retrialTargets.push(currentMethodInfo);
    return [rates, retrialTargets];
  }

  Logger.debug("Flat rate onGetShippingRates", rates);
  return [rates, retrialTargets];
}
// run getShippingRates when the onGetShippingRates event runs
Hooks.Events.add("onGetShippingRates", getShippingRates);
