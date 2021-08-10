import stripe from "stripe";
import config from "../config.js";

// This should not be customized per application.
const APP_INFO = {
  name: "ReactionCommerce",
  url: "https://github.com/reactioncommerce/reaction"
};

/**
 * @summary Gets an instance of the Stripe API configured with an API key passed from env.
 * @param {Object} context The context object
 * @returns {Object} The Stripe SDK object
 */
export default async function getStripeInstance(context) {
  const { STRIPE_API_KEY } = config;

  return stripe(STRIPE_API_KEY, {
    appInfo: {
      ...APP_INFO,
      version: context.appVersion
    }
  });
}
