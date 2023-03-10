import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import extendCommonOrder from "../util/extendCommonOrder.js";

const logCtx = { name: "fulfillment", file: "fulfillmentMethodsWithQuotes" };

/**
 * @name fulfillmentMethodsWithQuotes
 * @method
 * @summary Just gets rates, without updating anything
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Object} context - Context
 * @returns {Array} return updated rates in cart
 * @private
 */
export default async function fulfillmentMethodsWithQuotes(commonOrder, context) {
  const rates = [];
  const retrialTargets = [];

  // must have items to calculate shipping
  if (!commonOrder.items || !commonOrder.items.length) {
    Logger.debug(logCtx, "fulfillmentMethodsWithQuotes called with CommonOrder with no items");
    return rates;
  }
  const commonOrderExtended = await extendCommonOrder(context, commonOrder);

  const fulfillmentTypeInGroup = commonOrder.fulfillmentType;
  if (!fulfillmentTypeInGroup) throw new ReactionError("not-found", "Fulfillment type not found in commonOrder");

  const allFuncsArray = context.getFunctionsOfType("fulfillmentMethodsWithQuotes");
  const ffTypeFuncObjects = allFuncsArray.filter((func) => fulfillmentTypeInGroup === func.key);
  const funcs = ffTypeFuncObjects.map((func) => func.handler);

  if (_.isEmpty(funcs)) throw new ReactionError("not-found", `No methods for Fulfillment type ${fulfillmentTypeInGroup}`);

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

  Logger.debug({ ...logCtx, rates }, "fulfillmentMethodsWithQuotes returning rates");
  return rates;
}
