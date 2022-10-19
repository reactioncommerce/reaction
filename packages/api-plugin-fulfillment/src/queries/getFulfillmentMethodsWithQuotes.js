import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import extendCommonOrder from "../util/extendCommonOrder.js";

const logCtx = { name: "fulfillment", file: "getFulfillmentWithQuotes" };

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
    Logger.debug(logCtx, "getFulfillmentMethodsWithQuotes called with CommonOrder with no items");
    return rates;
  }
  const commonOrderExtended = await extendCommonOrder(context, commonOrder);

  const fulfillmentTypeInGroup = commonOrder.fulfillmentType;
  if (!fulfillmentTypeInGroup) throw new ReactionError("not-found", "Fulfillment type not found in commonOrder");

  const functionTypesToCall = `getFulfillmentMethodsWithQuotes${fulfillmentTypeInGroup}`;
  const funcs = context.getFunctionsOfType(functionTypesToCall);

  if (!funcs || !Array.isArray(funcs) || !funcs.length) throw new ReactionError("not-found", `No methods for Fulfillment type ${fulfillmentTypeInGroup}`);

  let promises = funcs.map((rateFunction) => rateFunction(context, commonOrderExtended, [rates, retrialTargets]));
  await Promise.all(promises);

  // Try once more.
  if (retrialTargets.length > 0) {
    promises = funcs.map((rateFunction) => rateFunction(context, commonOrderExtended, [rates, retrialTargets]));
    await Promise.all(promises);

    if (retrialTargets.length > 0) {
      Logger.warn({ ...logCtx, retrialTargets }, "Failed to get fulfillment methods from these packages:");
    }
  }

  Logger.debug({ ...logCtx, rates }, "getFulfillmentMethodsWithQuotes returning rates");
  return rates;
}