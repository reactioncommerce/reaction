import { decodeCartItemsOpaqueIds, decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Mutation/addCartItems
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the addCartItems GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - The opaque ID of the cart to add the items to.
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.items - An array of cart items to add to the new cart. Must not be empty.
 * @param {String} [args.input.token] - The anonymous access token that was returned from `createCart`.
 *   Required for anonymous carts.
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddCartItemsPayload
 */
export default async function addCartItems(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, items: itemsInput, token } = input;
  const cartId = decodeCartOpaqueId(opaqueCartId);
  const items = decodeCartItemsOpaqueIds(itemsInput);

  const {
    cart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  } = await context.mutations.addCartItems(context, {
    cartId,
    items,
    token
  });

  return {
    cart,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    clientMutationId
  };
}
