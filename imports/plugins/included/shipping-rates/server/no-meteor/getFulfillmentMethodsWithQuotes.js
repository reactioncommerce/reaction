import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import isShippingRestricted from "./util/isShippingRestricted";
import filterShippingMethods from "./util/filterShippingMethods";

/**
 * @summary Returns a list of fulfillment method quotes based on the items in a fulfillment group.
 * @param {Object} context - Context
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Array} [previousQueryResults] - an array of shipping rates and
 * info about failed calls to the APIs of some shipping methods providers
 * e.g Shippo.
 * @return {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 * @private
 */
export default async function getFulfillmentMethodsWithQuotes(context, commonOrder, previousQueryResults = []) {
  const { collections } = context;
  const { Packages, Shipping } = collections;
  const [rates = [], retrialTargets = []] = previousQueryResults;
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

  // Verify that we have a valid address to work with
  if (!commonOrder.shippingAddress) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "Fulfillment group is missing a shipping address"
    };
    rates.push(errorDetails);
    return [rates, retrialTargets];
  }

  let merchantShippingRates = false;
  const marketplaceSettings = await Packages.findOne({
    name: "reaction-marketplace",
    shopId: context.shopId, // the primary shop always owns the marketplace settings
    enabled: true // only use the marketplace settings if marketplace is enabled
  });
  if (marketplaceSettings && marketplaceSettings.settings && marketplaceSettings.settings.enabled) {
    ({ merchantShippingRates } = marketplaceSettings.settings.public);
  }

  if (merchantShippingRates) {
    // TODO this needs to be rewritten to handle getting rates from each shops that's represented on the order
    throw new ReactionError("not-implemented", "Multiple shipping providers is currently not supported");
  }

  const pkgData = await Packages.findOne({
    name: "reaction-shipping-rates",
    shopId: context.shopId
  });

  if (!pkgData || pkgData.settings.flatRates.enabled !== true) {
    return [rates, retrialTargets];
  }

  const shippingRateDocs = await Shipping.find({
    "shopId": commonOrder.shopId,
    "provider.enabled": true
  }).toArray();

  const initialNumOfRates = rates.length;

  // Get hydrated order, an object of current order data including item and destination information
  const isOrderShippingRestricted = await isShippingRestricted(context, commonOrder);

  if (isOrderShippingRestricted) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "Flat rate shipping did not return any shipping methods."
    };
    rates.push(errorDetails);
  } else {
    const awaitedShippingRateDocs = shippingRateDocs.map(async (doc) => {
      const carrier = doc.provider.label;
      // Check for method specific shipping restrictions
      const availableShippingMethods = await filterShippingMethods(context, doc.methods, commonOrder);
      for (const method of availableShippingMethods) {
        if (!method.rate) {
          method.rate = 0;
        }
        if (!method.handling) {
          method.handling = 0;
        }
        // Store shipping provider here in order to have it available in shipmentMethod
        // for cart and order usage
        if (!method.carrier) {
          method.carrier = carrier;
        }
        const rate = method.rate + method.handling;
        rates.push({
          carrier,
          handlingPrice: method.handling,
          method,
          rate,
          shippingPrice: method.rate,
          shopId: doc.shopId
        });
      }
    });
    await Promise.all(awaitedShippingRateDocs);
  }

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

  Logger.debug("Flat rate getFulfillmentMethodsWithQuotes", rates);
  return [rates, retrialTargets];
}
