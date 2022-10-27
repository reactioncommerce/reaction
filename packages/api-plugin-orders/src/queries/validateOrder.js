import prepareOrder from "../util/orderValidators/prepareOrder.js";

/**
 * @name validateOrder
 * @method
 * @memberof Order
 * @summary Validates if the input order details is valid and ready for order processing
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - order details, refer inputSchema
 * @returns {Promise<Object>} output - validation results
 */
export default async function validateOrder(context, input) {
  const { errors, success } = await prepareOrder(context, input, "validateOrder");
  const output = { errors, success };
  return output;
}
