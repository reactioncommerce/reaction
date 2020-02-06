import config from "../config.js";
import getStripeInstance from "./getStripeInstance.js";

/**
 * @summary Given a shop ID, gets an instance of the Stripe API configured with that shop's API key.
 * @param {Object} context The context object
 * @returns {Object} The Stripe SDK object
 */
export default async function getStripeInstanceForShop(context) {
  const { STRIPE_API_KEY } = config;

  return getStripeInstance(context, STRIPE_API_KEY);
}
