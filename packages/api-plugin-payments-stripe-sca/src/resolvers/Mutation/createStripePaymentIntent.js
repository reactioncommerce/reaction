import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.createStripePaymentIntent
 * @method
 * @memberof Payments/GraphQL
 * @summary resolver for the createStripePaymentIntent GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.cartId] - The opaque ID of the cart to retrieve the total from.
 * @param {String} [args.input.shopId] - A shop ID
 * @param {String} [args.input.cartToken] - The anonymous access cartToken that was returned from `createCart`.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} CreateStripePaymentIntentPayload Object containing the Stripe Payment Intent client secret
 */
export default async function createStripePaymentIntent(
  parentResult,
  { input },
  context
) {
  const {
    clientMutationId = null,
    cartId: opaqueCartId,
    shopId: opaqueShopId,
    cartToken
  } = input;

  let cartId = null;
  if (opaqueCartId) {
    cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;
  }
  const shopId = isOpaqueId(opaqueShopId) ? decodeShopOpaqueId(opaqueShopId) : opaqueShopId;

  const paymentIntentClientSecret =
    await context.mutations.createStripePaymentIntent(context, {
      cartId,
      shopId,
      cartToken
    });

  return { clientMutationId, paymentIntentClientSecret };
}
