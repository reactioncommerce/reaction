import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeCartOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.anonymousCartByCartId
 * @method
 * @memberof Cart/GraphQL
 * @summary Get an anonymous cart by ID.
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.cartId - ID of the anonymous cart
 * @param {String} args.token - An anonymous cart token
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} A Cart object
 */
export default async function anonymousCartByCartId(parentResult, args, context) {
  const { cartId, cartToken } = args;

  return context.queries.anonymousCartByCartId(context, {
    cartId: isOpaqueId(cartId) ? decodeCartOpaqueId(cartId) : cartId,
    cartToken
  });
}
