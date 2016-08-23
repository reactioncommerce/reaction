import { BraintreeApi } from "./braintreeApi";
import { Logger } from "/server/api";
import { PaymentMethod } from "/lib/collections/schemas";

/**
 * braintreeSubmit
 * Authorize, or authorize and capture payments from Braintree
 * https://developers.braintreepayments.com/reference/request/transaction/sale/node
 * @param {String} transactionType - either authorize or capture
 * @param {Object} cardData - Object containing everything about the Credit card to be submitted
 * @param {Object} paymentData - Object containing everything about the transaction to be settled
 * @return {Object} results - Object containing the results of the transaction
 */
export function paymentSubmit(transactionType, cardData, paymentData) {
  check(transactionType, String);
  check(cardData, {
    name: String,
    number: String,
    expirationMonth: String,
    expirationYear: String,
    cvv2: String,
    type: String
  });
  check(paymentData, {
    total: String,
    currency: String
  });

  const paymentSubmitDetails = {
    transactionType: transactionType,
    cardData: cardData,
    paymentData: paymentData
  };

  let result;

  try {
    const paymentSubmitResult = BraintreeApi.apiCall.paymentSubmit(paymentSubmitDetails);
    Logger.debug(paymentSubmitResult);
    result = paymentSubmitResult;
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot Submit Payment: ${error.message}`
    };
    Logger.fatal("Braintree call failed, payment was not submitted");
  }

  return result;
}


/**
 * paymentCapture
 * Capture payments from Braintree
 * https://developers.braintreepayments.com/reference/request/transaction/submit-for-settlement/node
 * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
 * @return {Object} results - Object containing the results of the transaction
 */
export function paymentCapture(paymentMethod) {
  check(paymentMethod, PaymentMethod);

  const paymentCaptureDetails = {
    transactionId: paymentMethod.transactionId,
    amount: paymentMethod.amount
  };

  let result;

  try {
    const paymentCaptureResult = BraintreeApi.apiCall.captureCharge(paymentCaptureDetails);
    Logger.debug(paymentCaptureResult);
    result = paymentCaptureResult;
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot Capture Payment: ${error.message}`
    };
    Logger.fatal("Braintree call failed, payment was not captured");
  }

  return result;
}


/**
 * createRefund
 * Refund BrainTree payment
 * https://developers.braintreepayments.com/reference/request/transaction/refund/node
 * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
 * @param {Number} amount - Amount to be refunded if not the entire amount
 * @return {Object} results - Object containing the results of the transaction
 */
export function createRefund(paymentMethod, amount) {
  check(paymentMethod, PaymentMethod);
  check(amount, Number);

  const refundDetails = {
    transactionId: paymentMethod.transactionId,
    amount: amount
  };

  let result;

  try {
    const refundResult = BraintreeApi.apiCall.createRefund(refundDetails);
    Logger.debug(refundResult);
    result = refundResult;
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot issue refund: ${error.message}`
    };
    Logger.fatal("Braintree call failed, refund was not issued");
  }

  return result;
}


/**
 * listRefunds
 * List all refunds for a transaction
 * https://developers.braintreepayments.com/reference/request/transaction/find/node
 * @param {Object} paymentMethod - Object containing everything about the transaction to be settled
 * @return {Array} results - An array of refund objects for display in admin
 */
export function listRefunds(paymentMethod) {
  check(paymentMethod, Object);

  const refundListDetails = {
    transactionId: paymentMethod.transactionId
  };

  let result;

  try {
    const refundListResult = BraintreeApi.apiCall.listRefunds(refundListDetails);
    Logger.debug(refundListResult);
    result = refundListResult;
  } catch (error) {
    Logger.error(error);
    result = {
      saved: false,
      error: `Cannot list refunds: ${error.message}`
    };
    Logger.fatal("Braintree call failed, refunds not listed");
  }

  return result;
}
