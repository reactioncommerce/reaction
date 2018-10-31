import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import cartShippingRestricted from "./util/cartShippingRestricted";
import filterShippingMethods from "./util/filterShippingMethods";
import getShippingRestrictionAttributes from "./util/getShippingRestrictionAttributes";

/**
 * @summary Returns a list of fulfillment method quotes based on the items in a fulfillment group.
 * @param {Object} context - Context
 * @param {Object} fulfillmentGroup - details about the purchase a user wants to make.
 * @param {Object} cartWithSummary - the user's cart with its summary
 * @param {Array} [previousQueryResults] - an array of shipping rates and
 * info about failed calls to the APIs of some shipping methods providers
 * e.g Shippo.
 * @return {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 * @private
 */
export default async function getFulfillmentMethodsWithQuotes(context, fulfillmentGroup, cartWithSummary, previousQueryResults = []) {

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
  let shippingErrorDetails;
  if (!fulfillmentGroup.address) {
    shippingErrorDetails = {
      requestStatus: "error",
      shippingProvider: "flat-rate-shipping",
      message: "Fulfillment group is missing a shipping address"
    };
    return [[shippingErrorDetails], []];
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
    "shopId": fulfillmentGroup.shopId,
    "provider.enabled": true
  }).toArray();

  // Get hydrated cart, an object of current order data including item and destination information
  const hydratedCart = await getShippingRestrictionAttributes(context, cartWithSummary, fulfillmentGroup); // TODO: possibly change function name

  const initialNumOfRates = rates.length;
  shippingRateDocs.forEach((doc) => {
    // Check for universal shipping restrictions
    // If any apply, all shipping methods are blocked
    if (cartShippingRestricted(hydratedCart, doc)) {
      const errorDetails = {
        requestStatus: "error",
        shippingProvider: "flat-rate-shipping",
        message: "Flat rate shipping did not return any shipping methods."
      };
      rates.push(errorDetails);
    } else {
      const carrier = doc.provider.label;
      // Check for method specific shipping restrictions
      const availableShippingMethods = filterShippingMethods(doc.methods, hydratedCart);
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
    }
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

  Logger.debug("Flat rate getFulfillmentMethodsWithQuotes", rates);
  return [rates, retrialTargets];
}
