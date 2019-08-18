import { decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Mutation/setEmailOnAnonymousCart
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the setEmailOnAnonymousCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - An anonymous cart ID
 * @param {String} args.input.token - The token for accessing the anonymous cart
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.email - The email address to associate with this cart
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} SetEmailOnAnonymousCartPayload
 */
export default async function setEmailOnAnonymousCart(parentResult, { input }, context) {
  const {
    cartId: opaqueCartId,
    clientMutationId = null,
    email,
    token
  } = input;

  const cartId = decodeCartOpaqueId(opaqueCartId);

  const { cart } = await context.mutations.setEmailOnAnonymousCart(context, {
    cartId,
    email,
    token
  });

  return {
    cart,
    clientMutationId
  };
}
