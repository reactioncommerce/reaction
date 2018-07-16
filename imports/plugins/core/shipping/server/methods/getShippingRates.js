import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { Cart as CartSchema } from "/lib/collections/schemas";

/**
 * @name shipping/getShippingRates
 * @method
 * @memberof Shipping/Methods
 * @summary Just gets rates, without updating anything
 * @param {Object} cart - cart object
 * @return {Array} return updated rates in cart
 */
export default function getShippingRates(cart) {
  CartSchema.validate(cart);
  const rates = [];
  const retrialTargets = [];
  // must have items to calculate shipping
  if (!cart.items || !cart.items.length) {
    return rates;
  }
  // hooks for other shipping rate events
  // all callbacks should return rates
  Hooks.Events.run("onGetShippingRates", [rates, retrialTargets], cart);

  // Try once more.
  if (retrialTargets.length > 0) {
    Hooks.Events.run("onGetShippingRates", [rates, retrialTargets], cart);

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
