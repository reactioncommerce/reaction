/**
 * @name exampleCapturePayment
 * @method
 * @summary Capture payment for Example payment method
 * @param {Object} context an object containing the per-request state
 * @param {Object} payment object containing authorization ID
 * @returns {Object} result for capturing a payment
 * @private
 */
export default function exampleCapturePayment() {
  return { saved: true, response: {} };
}
