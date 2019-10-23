import ReactionError from "@reactioncommerce/reaction-error";
import getStripeInstance from "./getStripeInstance.js";

const PACKAGE_NAME = "reaction-marketplace";

/**
 * @summary Given a shop ID, gets the Stripe package data for that shop and an instance
 *   of the Stripe API configured with that shop's API key.
 * @param {Object} context The context object, with `collections.Packages` on it
 * @param {String} shopId The shop ID
 * @returns {Object} { stripe: The Stripe SDK object, applicationFee }
 */
export default async function getStripeInstanceForShop(context, shopId) {
  const { collections } = context;
  const { Packages, Shops } = collections;

  const shop = await Shops.findOne({ _id: shopId });

  let merchantStripeUserId = null;
  let primaryStripePkg;

  // If merchant shop order, then get the stripe ID and the primary shop's
  // application fee.
  if (shop.shopType === "merchant") {
    const merchantStripePkg = await Packages.findOne({ name: PACKAGE_NAME, shopId });
    // If this merchant doesn't have stripe setup, fail.
    if (!merchantStripePkg ||
      !merchantStripePkg.settings ||
      !merchantStripePkg.settings.connectAuth ||
      !merchantStripePkg.settings.connectAuth.stripe_user_id) {
      throw new ReactionError("server-error", `Error processing payment for merchant shop with ID ${shopId}`);
    }
    merchantStripeUserId = merchantStripePkg.settings.connectAuth.stripe_user_id;

    const primaryShop = await Shops.findOne({ shopType: "primary" });
    primaryStripePkg = await Packages.findOne({ name: PACKAGE_NAME, shopId: primaryShop._id });
  } else {
    primaryStripePkg = await Packages.findOne({ name: PACKAGE_NAME, shopId });
  }

  const stripeApiKey = primaryStripePkg && primaryStripePkg.settings && primaryStripePkg.settings.api_key;
  if (!stripeApiKey) {
    throw new ReactionError("server-error", "Stripe is not configured properly. Please set an API Key.");
  }

  const stripe = getStripeInstance(context, stripeApiKey);

  const applicationFee = primaryStripePkg.settings.applicationFee || 0;

  return {
    applicationFee,
    merchantStripeUserId,
    stripe
  };
}
