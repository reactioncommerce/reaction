import Logger from "@reactioncommerce/logger";
import extendCommonOrder from "../util/extendCommonOrder.js";

/**
 * @name getFulfillmentMethodsWithQuotes
 * @method
 * @summary Just gets rates, without updating anything
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Object} context - Context
 * @returns {Array} return updated rates in cart
 * @private
 */
export default async function getFulfillmentMethodsWithQuotes(commonOrder, context) {
  const rates = [];
  const retrialTargets = [];

  // must have items to calculate shipping
  if (!commonOrder.items || !commonOrder.items.length) {
    Logger.debug("getFulfillmentMethodsWithQuotes called with CommonOrder with no items");
    return rates;
  }

  const commonOrderExtended = await extendCommonOrder(context, commonOrder);

  const funcs = context.getFunctionsOfType("getFulfillmentMethodsWithQuotes");
  let promises = funcs.map((rateFunction) => rateFunction(context, commonOrderExtended, [rates, retrialTargets]));
  await Promise.all(promises);

  // Try once more.
  if (retrialTargets.length > 0) {
    promises = funcs.map((rateFunction) => rateFunction(context, commonOrderExtended, [rates, retrialTargets]));
    await Promise.all(promises);

    if (retrialTargets.length > 0) {
      Logger.warn("Failed to get fulfillment methods from these packages:", retrialTargets);
    }
  }

  Logger.debug("getFulfillmentMethodsWithQuotes returning rates", rates);
  return rates;
}
