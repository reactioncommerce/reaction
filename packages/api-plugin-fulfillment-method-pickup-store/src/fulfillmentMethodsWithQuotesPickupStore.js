import Logger from "@reactioncommerce/logger";
import collectStoreDetails from "./util/collectStoreDetails.js";

const packageName = "fulfillment-method-pickup-store";
const fulfillmentTypeName = "pickup";
const fulfillmentMethodName = "store";
const logCtx = { name: "fulfillment-method-pickup-store", file: "fulfillmentMethodsWithQuotesPickupStore" };

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
export default async function fulfillmentMethodsWithQuotesPickupStore(context, commonOrder, previousQueryResults = []) {
  const { collections: { Fulfillment } } = context;
  const [rates = [], retrialTargets = []] = previousQueryResults;
  const currentMethodInfo = { packageName };

  if (retrialTargets.length > 0) {
    const isNotAmongFailedRequests = retrialTargets.every((target) => target.packageName !== packageName);
    if (isNotAmongFailedRequests) {
      return previousQueryResults;
    }
  }

  const pickupFulfillmentType = await Fulfillment.findOne({
    "shopId": commonOrder.shopId,
    "fulfillmentType": fulfillmentTypeName,
    "provider.enabled": true
  });
  if (!pickupFulfillmentType) {
    return [rates, retrialTargets];
  }

  const initialNumOfRates = rates.length;


  const carrier = pickupFulfillmentType.provider?.label || "";
  const currentPluginMethods = pickupFulfillmentType.methods ?
    pickupFulfillmentType.methods.filter((method) => ((method.name === fulfillmentMethodName) && (method.enabled))) : [];

  for (const method of currentPluginMethods) {
    const updatedMethod = collectStoreDetails(method, commonOrder);
    rates.push({
      carrier,
      handlingPrice: updatedMethod.handling,
      method: updatedMethod,
      rate: updatedMethod.rate,
      shippingPrice: updatedMethod.rate + updatedMethod.handling,
      shopId: pickupFulfillmentType.shopId
    });
  }

  if (rates.length === initialNumOfRates) {
    const errorDetails = {
      requestStatus: "error",
      shippingProvider: packageName,
      message: "Pickup Store did not return any pickup methods."
    };
    rates.push(errorDetails);
    retrialTargets.push(currentMethodInfo);
    return [rates, retrialTargets];
  }

  Logger.debug({ ...logCtx, rates }, "Store fulfillmentMethodsWithQuotesPickupStore");
  return [rates, retrialTargets];
}
