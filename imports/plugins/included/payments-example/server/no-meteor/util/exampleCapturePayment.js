import { ExampleApi } from "../../methods/exampleapi";

/**
 * @name exampleCapturePayment
 * @method
 * @summary Capture payment for Stripe payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing transaction ID
 * @return {Promise} capturing a payment in Stripe
 * @private
 */
export default async function exampleCapturePayment(context, payment) {
  const { amount, transactionId: authorizationId } = payment;
  const response = ExampleApi.methods.capture.call({
    authorizationId,
    amount
  });
  const result = {
    saved: true,
    response
  };
  return result;
}
