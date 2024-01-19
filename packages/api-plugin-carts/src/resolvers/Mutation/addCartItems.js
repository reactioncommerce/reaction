import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartItemsOpaqueIds, decodeCartOpaqueId } from "../../xforms/id.js";

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
 * @param {String} [args.input.cartToken] - The anonymous access cartToken that was returned from `createCart`.
 *   Required for anonymous carts.
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddCartItemsPayload
 */
export default async function addCartItems(parentResult, { input }, context) {
  const { cartId: opaqueCartId, clientMutationId = null, items: itemsInput, cartToken } = input;
  const cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;
  const items = decodeCartItemsOpaqueIds(itemsInput);

  const {
    cart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  } = await context.mutations.addCartItems(context, {
    cartId,
    items,
    cartToken
  });

  return {
    cart,
    incorrectPriceFailures,
    minOrderQuantityFailures,
    clientMutationId
  };
}
