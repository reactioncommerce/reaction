import ReactionError from "@reactioncommerce/reaction-error";
import hashToken from "@reactioncommerce/api-utils/hashToken.js";
import xformCartCheckout from "@reactioncommerce/api-plugin-carts/src/xforms/xformCartCheckout.js";
import getStripeInstance from "../util/getStripeInstance.js";

/**
 * @method createStripePaymentIntent
 * @summary Creates a Stripe Payment Intent and return the client secret
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - Necessary input. See SimpleSchema
 * @return {Promise<String>} String with the client secret of the Payment Intent
 */
export default async function createStripePaymentIntent(
  context,
  { cartId, shopId, cartToken }
) {
  const { accountId, collections } = context;
  const { Cart } = collections;

  if (!cartId) {
    throw new ReactionError("invalid-param", "You need to provide a cart ID");
  }

  const selector = { _id: cartId };
  if (cartToken) {
    selector.anonymousAccessToken = hashToken(cartToken);
  } else if (accountId) {
    selector.accountId = accountId;
  } else {
    throw new ReactionError(
      "invalid-param",
      "A token is required when updating an anonymous cart"
    );
  }

  const cart = await Cart.findOne(selector);

  const checkoutInfo = await xformCartCheckout(collections, cart);

  const totalAmount = Math.round(checkoutInfo.summary.total.amount * 100);

  const shop = await context.queries.shopById(context, shopId);

  const stripe = await getStripeInstance(context);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: cart.currencyCode,
      description: `${shop.name} Ref: ${cart.referenceId}`,
      /* eslint-disable camelcase */
      payment_method_types: ["card"],
      /* eslint-disable camelcase */
      capture_method: "manual",
      metadata: {
        integration_check: "accept_a_payment"
      } /* eslint-disable camelcase */
    });

    return paymentIntent.client_secret;
  } catch (error) {
    throw new ReactionError("invalid-payment", error.message);
  }
}
