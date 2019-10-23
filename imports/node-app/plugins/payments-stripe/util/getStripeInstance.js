import stripeNpm from "stripe";

// This should not be customized per application.
const APP_INFO = {
  name: "ReactionCommerce",
  url: "https://github.com/reactioncommerce/reaction"
};

/**
 * @name getStripeInstance
 * @param {Object} context App context
 * @param {String} stripeApiKey Stripe API Key, see https://stripe.com/docs/keys
 * @returns {Object} The Stripe SDK object
 */
export default function getStripeInstance(context, stripeApiKey) {
  const stripe = stripeNpm(stripeApiKey);
  stripe.setAppInfo({
    ...APP_INFO,
    version: context.appVersion
  });
  return stripe;
}
