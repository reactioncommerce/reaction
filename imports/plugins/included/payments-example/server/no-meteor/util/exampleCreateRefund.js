import { ExampleApi } from "./exampleapi";

/**
 * @name exampleCreateRefund
 * @method
 * @summary Create a refund for an order for example payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @param {Number} amount the amount to be refunded
 * @return {Object} refund result
 * @private
 */
export default function exampleCreateRefund(context, payment, amount) {
  const { transactionId } = payment;
  const response = ExampleApi.refund({
    transactionId,
    amount
  });
  const results = {
    saved: true,
    response
  };
  return results;
}
