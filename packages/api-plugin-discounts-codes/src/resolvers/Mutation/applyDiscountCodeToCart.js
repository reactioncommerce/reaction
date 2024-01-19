import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/applyDiscountCodeToCart
 * @method
 * @memberof Fulfillment/GraphQL
 * @summary resolver for the applyDiscountCodeToCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input.cartId - Cart to add discount to
 * @param {Object} args.input.discountCode - Discount code to add to cart
 * @param {String} args.input.shopId - Shop cart belongs to
 * @param {String} [args.input.token] - Cart token, if anonymous
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} applyDiscountCodeToCartPayload
 */
export default async function applyDiscountCodeToCart(parentResult, { input }, context) {
  const {
    clientMutationId = null,
    cartId,
    discountCode,
    shopId,
    token
  } = input;

  const updatedCartWithAppliedDiscountCode = await context.mutations.applyDiscountCodeToCart(context, {
    cartId: isOpaqueId(cartId) ? decodeCartOpaqueId(cartId) : cartId,
    discountCode,
    shopId: isOpaqueId(shopId) ? decodeShopOpaqueId(shopId) : shopId,
    token
  });

  return {
    clientMutationId,
    cart: updatedCartWithAppliedDiscountCode
  };
}
