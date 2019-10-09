import { decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { decodeDiscountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/discount";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/removeDiscountCodeFromCart
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the removeDiscountCodeFromCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.cartId - Cart to remove discount from
 * @param {Object} args.input.discountId - Discount code Id to remove from cart
 * @param {String} args.input.shopId - Shop cart belongs to
 * @param {String} [args.input.token] - Cart token, if anonymous
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} removeDiscountCodeFromCartPayload
 */
export default async function removeDiscountCodeFromCart(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    cartId,
    discountId,
    shopId,
    token
  } = input;

  const updatedCartWithRemovedDiscountCode = await context.mutations.removeDiscountCodeFromCart(context, {
    cartId: decodeCartOpaqueId(cartId),
    discountId: decodeDiscountOpaqueId(discountId),
    shopId: decodeShopOpaqueId(shopId),
    token
  });

  return {
    clientMutationId,
    cart: updatedCartWithRemovedDiscountCode
  };
}
