import { ExampleApi } from "./exampleapi";

/**
 * @name exampleCapturePayment
 * @method
 * @summary Capture payment for Example payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing authorization ID
 * @return {Object} result for capturing a payment
 * @private
 */
export default function exampleCapturePayment(context, payment) {
  const { amount, transactionId: authorizationId } = payment;
  const response = ExampleApi.capture({ authorizationId, amount });
  const result = {
    saved: true,
    response
  };
  return result;
}
