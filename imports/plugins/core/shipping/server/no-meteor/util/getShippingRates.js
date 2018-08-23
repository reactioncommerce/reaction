import Logger from "@reactioncommerce/logger";
import { getRegisteredFunctionsForType } from "/imports/core-server";

/**
 * @name getShippingRates
 * @method
 * @summary Just gets rates, without updating anything
 * @param {Object} cart - cart object
 * @param {Object} context - Context
 * @return {Array} return updated rates in cart
 * @private
 */
export default async function getShippingRates(cart, context) {
  const rates = [];
  const retrialTargets = [];
  // must have items to calculate shipping
  if (!cart.items || !cart.items.length) {
    return rates;
  }

  const rateFunctions = getRegisteredFunctionsForType("getShippingPrices");

  let promises = rateFunctions.map((rateFunction) => rateFunction(context, cart, [rates, retrialTargets]));
  await Promise.all(promises);

  // Try once more.
  if (retrialTargets.length > 0) {
    promises = rateFunctions.map((rateFunction) => rateFunction(context, cart, [rates, retrialTargets]));
    await Promise.all(promises);

    if (retrialTargets.length > 0) {
      Logger.warn("Failed to get shipping methods from these packages:", retrialTargets);
    }
  }

  let newRates = rates.filter(({ requestStatus }) => requestStatus !== "error");
  if (newRates.length === 0) {
    newRates = [{
      requestStatus: "error",
      shippingProvider: "all",
      message: "All requests for shipping methods failed."
    }];
  }

  Logger.debug("getShippingRates returning rates", rates);
  return newRates;
}
