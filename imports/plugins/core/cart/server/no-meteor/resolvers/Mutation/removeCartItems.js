import { decodeCartItemOpaqueId, decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Mutation/removeCartItems
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the removeCartItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The ID of the cart in which all of the items exist
 * @param {String[]} args.input.cartItemIds - Array of item IDs to update
 * @param {String} args.input.token - The token if the cart is an anonymous cart
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} RemoveCartItemsPayload
 */
export default async function removeCartItems(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, cartItemIds: opaqueCartItemIds, token } = input;

  const cartId = decodeCartOpaqueId(opaqueCartId);
  const cartItemIds = opaqueCartItemIds.map(decodeCartItemOpaqueId);

  const { cart } = await context.mutations.removeCartItems(context, {
    cartId,
    cartItemIds,
    token
  });

  return {
    cart,
    clientMutationId
  };
}
