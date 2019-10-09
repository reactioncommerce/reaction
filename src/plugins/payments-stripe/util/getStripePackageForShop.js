import { STRIPE_PACKAGE_NAME } from "./constants.js";

/**
 * @summary Given a shop ID, gets the Stripe package data for that shop.
 * @param {Object} context The context object, with `collections.Packages` on it
 * @param {String} shopId The shop ID
 * @returns {Object} The Stripe package data.
 */
export default async function getStripePackageForShop(context, shopId) {
  const { Packages } = context.collections;

  return Packages.findOne({
    name: STRIPE_PACKAGE_NAME,
    shopId
  });
}
