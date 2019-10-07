import { decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Mutation/reconcileCarts
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the reconcileCarts GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.anonymousCartId - The anonymous cart ID
 * @param {String} args.input.anonymousCartToken - The anonymous access token that was returned from `createCart`
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} [args.input.mode] - The reconciliation mode, "merge", "keepAccountCart", or "keepAnonymousCart". Default "merge"
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} ReconcileCartsPayload
 */
export default async function reconcileCarts(parentResult, { input }, context) {
  const {
    anonymousCartId: opaqueAnonymousCartId,
    anonymousCartToken,
    clientMutationId = null,
    mode
  } = input;

  const { cart } = await context.mutations.reconcileCarts(context, {
    anonymousCartId: decodeCartOpaqueId(opaqueAnonymousCartId),
    anonymousCartToken,
    mode
  });

  return { cart, clientMutationId };
}
