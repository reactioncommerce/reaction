import calculateUPSRate from "./util/calculateUPSRate.js";

const packageName = "fulfillment-method-shipping-ups";
const fulfillmentTypeName = "shipping";
const fulfillmentMethodName = "ups";

/**
 * @summary Returns a list of fulfillment method quotes based on the items in a fulfillment group.
 * @param {Object} context - Context
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Array} [previousQueryResults] - an array of shipping rates and
 * info about failed calls to the APIs of some shipping methods providers
 * e.g Shippo.
 * @returns {Array} - an array that contains two arrays: the first array will
 * be an updated list of shipping rates, and the second will contain info for
 * retrying this specific package if any errors occurred while retrieving the
 * shipping rates.
 * @private
 */
export default async function getFulfillmentMethodsWithQuotesShippingUPS(context, commonOrder, previousQueryResults = []) {
  const { collections } = context;
  const { Fulfillment } = collections;
  const [rates = [], retrialTargets = []] = previousQueryResults;
  const currentMethodInfo = { packageName };

  if (retrialTargets.length > 0) {
    const isNotAmongFailedRequests = retrialTargets.every((target) => target.packageName !== packageName);
    if (isNotAmongFailedRequests) {
      return previousQueryResults;
    }
  }

  const shippingRateDocs = await Fulfillment.find({
    "shopId": commonOrder.shopId,
    "fulfillmentType": fulfillmentTypeName,
    "provider.enabled": true
  }).toArray();
  if (!shippingRateDocs || !shippingRateDocs.length) {
    return [rates, retrialTargets];
  }
  const initialNumOfRates = rates.length;

  const awaitedShippingRateDocs = shippingRateDocs.map(async (doc) => {
    const carrier = doc.provider.label;
    const currentPluginMethods = doc.methods.filter((method) => ((method.fulfillmentMethod === (fulfillmentMethodName)) && (method.enabled)));
    for (const method of currentPluginMethods) {
      const updatedMethod = calculateUPSRate(method, commonOrder);
      rates.push({
        carrier,
        handlingPrice: updatedMethod.handling,
        method: updatedMethod,
        rate: updatedMethod.rate,
        shippingPrice: updatedMethod.rate + updatedMethod.handling,
        shopId: doc.shopId
      });
    }
  });
  await Promise.all(awaitedShippingRateDocs);

  if (rates.length === initialNumOfRates) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: packageName,
      message: "UPS shipping did not return any shipping methods."
    };
    rates.push(errorDetails);
    retrialTargets.push(currentMethodInfo);
    return [rates, retrialTargets];
  }

  return [rates, retrialTargets];
}
