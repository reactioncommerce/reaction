import stripeNpm from "stripe";
import packageJson from "/package.json";

// This should not be customized per application.
const APP_INFO = {
  name: "ReactionCommerceMarketplace",
  version: packageJson.version,
  url: packageJson.url
};

/**
 * @name getStripeInstance
 * @param {String} stripeApiKey Stripe API Key, see https://stripe.com/docs/keys
 * @returns {Object} The Stripe SDK object
 */
export default function getStripeInstance(stripeApiKey) {
  const stripe = stripeNpm(stripeApiKey);
  stripe.setAppInfo(APP_INFO);
  return stripe;
}
