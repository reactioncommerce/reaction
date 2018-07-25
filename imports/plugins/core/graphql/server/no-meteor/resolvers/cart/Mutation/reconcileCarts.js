import { decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Mutation.reconcileCarts"
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the reconcileCarts GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.anonymousCartId - The anonymous cart ID
 * @param {String} args.input.anonymousCartToken - The anonymous access token that was returned from `createCart`
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} [args.input.mode] - The reconciliation mode, "merge", "keepAccountCart", or "keepAnonymousCart". Default "merge"
 * @param {String} args.input.shopId - The ID of the shop that owns both carts
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} ReconcileCartsPayload
 */
export default async function reconcileCarts(parentResult, { input }, context) {
  const {
    anonymousCartId: opaqueAnonymousCartId,
    anonymousCartToken,
    clientMutationId = null,
    mode,
    shopId: opaqueShopId
  } = input;

  const { cart } = await context.mutations.cart.reconcileCarts(context, {
    anonymousCartId: decodeCartOpaqueId(opaqueAnonymousCartId),
    anonymousCartToken,
    mode,
    shopId: decodeShopOpaqueId(opaqueShopId)
  });

  return { cart, clientMutationId };
}
