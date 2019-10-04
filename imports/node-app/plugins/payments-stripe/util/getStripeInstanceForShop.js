import ReactionError from "@reactioncommerce/reaction-error";
import Logger from "@reactioncommerce/logger";
import getStripeInstance from "./getStripeInstance.js";
import getStripePackageForShop from "./getStripePackageForShop.js";

/**
 * @summary Given a shop ID, gets an instance of the Stripe API configured with that shop's API key.
 * @param {Object} context The context object, with `collections.Packages` on it
 * @param {String} shopId The shop ID
 * @returns {Object} The Stripe SDK object
 */
export default async function getStripeInstanceForShop(context, shopId) {
  const stripePkg = await getStripePackageForShop(context, shopId);
  const stripePkgSettings = (stripePkg || {}).settings || {};

  const stripeApiKey = stripePkgSettings.api_key;
  if (!stripeApiKey) {
    const stripeAccessToken = (stripePkgSettings.connectAuth || {}).access_token;
    if (stripeAccessToken) {
      Logger.warn("Using a Stripe access_token instead of an api_key is deprecated. Please set an API Key.");
      return getStripeInstance(context, stripeAccessToken);
    }

    throw new ReactionError("not-configured", "Stripe is not configured properly. Please set an API Key.");
  }

  return getStripeInstance(context, stripeApiKey);
}
