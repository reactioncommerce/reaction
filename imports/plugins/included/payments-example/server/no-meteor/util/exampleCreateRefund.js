import { ExampleApi } from "../../methods/exampleapi";

/**
 * @name exampleCreateRefund
 * @method
 * @summary Create a Stripe refund for an order
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing authorization ID
 * @param {Number} amount the amount to be refunded
 * @return {Object} refund result
 * @private
 */
export default async function exampleCreateRefund(context, payment, amount) {
  const { transactionId } = payment;
  const response = ExampleApi.methods.refund.call({
    transactionId,
    amount
  });
  const results = {
    saved: true,
    response
  };
  return results;
}
