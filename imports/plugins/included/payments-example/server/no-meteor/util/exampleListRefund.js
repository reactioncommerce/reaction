import { ExampleApi } from "../../methods/exampleapi";

/**
 * @name exampleListRefund
 * @method
 * @summary List refunds
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @return {Object} refund result
 * @private
 */
export default async function exampleListRefund(context, payment) {
  const { transactionId } = payment;
  const response = ExampleApi.methods.refunds.call({
    transactionId
  });
  const result = [];
  for (const refund of response.refunds) {
    result.push(refund);
  }

  // The results returned from the GenericAPI just so happen to look like exactly what the dashboard
  // wants. The return package should ba an array of objects that look like this
  // {
  //   type: "refund",
  //   amount: Number,
  //   created: Number: Epoch Time,
  //   currency: String,
  //   raw: Object
  // }
  const emptyResult = [];
  return emptyResult;
}
