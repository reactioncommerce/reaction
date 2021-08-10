export const STRIPE_PACKAGE_NAME = "payments-stripe-sca";
export const METHOD = "credit";
export const PAYMENT_METHOD_NAME = "stripe_payment_intent";
export const PROCESSOR = "Stripe";

// Stripe risk levels mapped to Reaction risk levels
export const riskLevelMap = {
  elevated: "elevated",
  highest: "high"
};
