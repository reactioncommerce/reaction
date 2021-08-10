import Random from "@reactioncommerce/random";
import {
  STRIPE_PACKAGE_NAME,
  METHOD,
  PAYMENT_METHOD_NAME,
  PROCESSOR,
  riskLevelMap
} from "./constants.js";
import getStripeInstance from "./getStripeInstance.js";

/**
 * Creates a Stripe charge for a single fulfillment group
 * @param {Object} context The request context
 * @param {Object} input Input necessary to create a payment
 * @returns {Object} The payment object in schema expected by the orders plugin
 */
export default async function stripeCreateAuthorizedPayment(context, input) {
  const {
    billingAddress,
    shopId,
    paymentData: { stripePaymentIntentId }
  } = input;

  const stripe = await getStripeInstance(context);

  const intent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
  const charges = intent.charges.data;

  return {
    _id: Random.id(),
    address: billingAddress,
    amount: intent.amount / 100,
    createdAt: new Date(),
    data: {
      stripePaymentIntentId,
      intent,
      gqlType: "StripePaymentData" // GraphQL union resolver uses this
    },
    displayName: "Stripe Payment",
    method: METHOD,
    mode: "authorize",
    name: PAYMENT_METHOD_NAME,
    paymentPluginName: STRIPE_PACKAGE_NAME,
    processor: PROCESSOR,
    riskLevel:
      riskLevelMap[
        charges[0] && charges[0].outcome && charges[0].outcome.risk_level
      ] || "normal",
    shopId,
    status: "created",
    transactionId: stripePaymentIntentId,
    transactions: charges
  };
}
