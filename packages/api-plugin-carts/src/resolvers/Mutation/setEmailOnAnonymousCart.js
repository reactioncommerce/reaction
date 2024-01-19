import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/setEmailOnAnonymousCart
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the setEmailOnAnonymousCart GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.cartId - An anonymous cart ID
 * @param {String} args.input.cartToken - The cartToken for accessing the anonymous cart
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
    cartToken
  } = input;

  const cartId = isOpaqueId(opaqueCartId) ? decodeCartOpaqueId(opaqueCartId) : opaqueCartId;

  const { cart } = await context.mutations.setEmailOnAnonymousCart(context, {
    cartId,
    email,
    cartToken
  });

  return {
    cart,
    clientMutationId
  };
}
