import fulfillmentMethodsWithQuotes from "./fulfillmentMethodsWithQuotes.js";

/**
 * @name getFulfillmentMethodsWithQuotes
 * @method
 * @summary This is an alias to fulfillmentMethodsWithQuotes for backward compatibility till removal
 * @param {Object} commonOrder - details about the purchase a user wants to make.
 * @param {Object} context - Context
 * @returns {Array} return updated rates in cart
 * @private
 * @deprecated since version 5.0, use fulfillmentMethodsWithQuotes instead
 */
export default async function getFulfillmentMethodsWithQuotes(commonOrder, context) {
  return fulfillmentMethodsWithQuotes(commonOrder, context);
}
