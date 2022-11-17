import Logger from "@reactioncommerce/logger";
import isShippingRestricted from "./util/isShippingRestricted.js";
import filterShippingMethods from "./util/filterShippingMethods.js";
import { logCtx } from "./index.js";

const packageName = "fulfillment-method-shipping-flat-rate";
const fulfillmentTypeName = "shipping";
const fulfillmentMethodName = "flatRate";

/**
 * @summary Returns a list of fulfillment method quotes based on the items in a fulfillment group.
 * @param {Object} context - Context
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Array} [previousQueryResults] - an array of shipping rates and
 * info about failed calls to the APIs of some shipping methods providers
 * @returns {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 * @private
 */
export default async function fulfillmentMethodsWithQuotesShippingFlatRate(context, commonOrder, previousQueryResults = []) {
  const { collections: { Fulfillment } } = context;
  const [rates = [], retrialTargets = []] = previousQueryResults;
  const currentMethodInfo = { packageName };

  logCtx.file = "src/fulfillmentMethodsWithQuotesShippingFlatRate.js";

  if (retrialTargets.length > 0) {
    const isNotAmongFailedRequests = retrialTargets.every((target) => target.packageName !== packageName);
    if (isNotAmongFailedRequests) {
      return previousQueryResults;
    }
  }

  const { isShippingRatesFulfillmentEnabled } = await context.queries.appSettings(context, commonOrder.shopId);
  if (!isShippingRatesFulfillmentEnabled) {
    return [rates, retrialTargets];
  }

  // Above validation is retained for backward compatibility. Below validation is go-forward way
  const shippingRateDocs = await Fulfillment.find({
    "shopId": commonOrder.shopId,
    "fulfillmentType": fulfillmentTypeName,
    "provider.enabled": true
  }).toArray();
  if (!shippingRateDocs || !shippingRateDocs.length) {
    return [rates, retrialTargets];
  }

  const initialNumOfRates = rates.length;

  // Get hydrated order, an object of current order data including item and destination information
  const isOrderShippingRestricted = await isShippingRestricted(context, commonOrder);

  if (isOrderShippingRestricted) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: packageName,
      message: "Flat rate shipping did not return any shipping methods."
    };
    rates.push(errorDetails);
  } else {
    const awaitedShippingRateDocs = shippingRateDocs.map(async (doc) => {
      const carrier = doc.provider.label;
      const currentPluginMethods = doc.methods.filter((method) => ((method.fulfillmentMethod === fulfillmentMethodName) && (method.enabled)));
      // Check for method specific shipping restrictions
      const availableShippingMethods = await filterShippingMethods(context, currentPluginMethods, commonOrder);

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
        method.methodAdditionalData = { // currently hard coded as a dummy entry, replace with a function
          gqlType: "flatRateData",
          flatRateData: 321
        };

        rates.push({
          carrier,
          handlingPrice: method.handling,
          method,
          rate: method.rate,
          shippingPrice: method.rate + method.handling,
          shopId: doc.shopId
        });
      }
    });
    await Promise.all(awaitedShippingRateDocs);
  }

  if (rates.length === initialNumOfRates) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: packageName,
      message: "Flat rate shipping did not return any shipping methods."
    };
    rates.push(errorDetails);
    retrialTargets.push(currentMethodInfo);
    return [rates, retrialTargets];
  }

  Logger.debug({ ...logCtx, rates }, "Flat rates returned");
  return [rates, retrialTargets];
}
