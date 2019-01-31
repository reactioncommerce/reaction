import ReactionError from "@reactioncommerce/reaction-error";
import getStripeInstance from "./getStripeInstance";

const PACKAGE_NAME = "reaction-stripe";

/**
 * @summary Given a shop ID, gets the Stripe package data for that shop and an instance
 *   of the Stripe API configured with that shop's API key.
 * @param {Object} context The context object, with `collections.Packages` on it
 * @param {String} shopId The shop ID
 * @returns {Object} The Stripe SDK object
 */
export default async function getStripeInstanceForShop(context, shopId) {
  const { collections } = context;
  const { Packages } = collections;

  const stripePkg = await Packages.findOne({
    name: PACKAGE_NAME,
    shopId
  });

  const stripeApiKey = stripePkg && stripePkg.settings && stripePkg.settings.api_key;
  if (!stripeApiKey) {
    throw new ReactionError("not-configured", "Stripe is not configured properly. Please set an API Key.");
  }

  return getStripeInstance(stripeApiKey);
}
