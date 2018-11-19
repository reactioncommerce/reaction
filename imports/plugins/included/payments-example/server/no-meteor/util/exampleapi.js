import Random from "@reactioncommerce/random";
import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";

// Test card to use to add risk level flag for testing purposes only.
export const RISKY_TEST_CARD = "4000000000009235";

// You should not implement ThirdPartyAPI. It is supposed to represent your third party API
// And is called so that it can be stubbed out for testing. This would be a library
// like Stripe or Authorize.net usually just included with a NPM.require

const ThirdPartyAPI = {
  capture(authorizationId, amount) {
    return {
      authorizationId,
      amount,
      success: true
    };
  },
  refund(transactionId, amount) {
    return {
      success: true,
      transactionId,
      amount
    };
  },
  listRefunds(transactionId) {
    return {
      transactionId,
      refunds: [
        {
          type: "refund",
          amount: 3.99,
          created: 1454034562000,
          currency: "usd",
          raw: {}
        }
      ]
    };
  }
};

// These are the "wrapper" functions you should write in order to make your code more
// testable. You can either mirror the API calls or normalize them to the authorize/capture/refund/refunds
// that Reaction is expecting

const paymentMethodSchema = new SimpleSchema({
  authorizationId: {
    type: String,
    optional: true
  },
  transactionId: {
    type: String,
    optional: true
  },
  amount: {
    type: Number,
    optional: true
  }
});

/**
 * @name capture
 * @summary Wrapper for ThirdPartyAPI capture method
 * @param {Object} paymentMethod object containing payment details
 * @return {Object} object containing capture result
 */
function capture(paymentMethod) {
  const cleanedPaymentMethod = paymentMethodSchema.clean(paymentMethod);
  paymentMethodSchema.validate(cleanedPaymentMethod);
  const { authorizationId, amount } = cleanedPaymentMethod;
  return ThirdPartyAPI.capture(authorizationId, amount);
}

/**
 * @name refund
 * @summary Wrapper for ThirdPartyAPI refund method
 * @param {Object} paymentMethod object containing payment details
 * @return {Object} object containing refund result
 */
function refund(paymentMethod) {
  const cleanedPaymentMethod = paymentMethodSchema.clean(paymentMethod);
  paymentMethodSchema.validate(cleanedPaymentMethod);
  const { transactionId, amount } = cleanedPaymentMethod;
  return ThirdPartyAPI.refund(transactionId, amount);
}

/**
 * @name refunds
 * @summary Wrapper for ThirdPartyAPI listRefunds method
 * @param {Object} paymentMethod object containing payment details
 * @return {Array} list of refund transactions
 */
function refunds(paymentMethod) {
  const cleanedPaymentMethod = paymentMethodSchema.clean(paymentMethod);
  paymentMethodSchema.validate(cleanedPaymentMethod);
  const { transactionId } = cleanedPaymentMethod;
  return ThirdPartyAPI.listRefunds(transactionId);
}

export const ExampleApi = {
  capture,
  refund,
  refunds
};
