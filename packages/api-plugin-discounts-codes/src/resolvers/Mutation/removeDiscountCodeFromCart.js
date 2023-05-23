import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartOpaqueId, decodeDiscountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

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
    cartId: isOpaqueId(cartId) ? decodeCartOpaqueId(cartId) : cartId,
    discountId: isOpaqueId(discountId) ? decodeDiscountOpaqueId(discountId) : discountId,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId,
    token
  });

  return {
    clientMutationId,
    cart: updatedCartWithRemovedDiscountCode
  };
}
