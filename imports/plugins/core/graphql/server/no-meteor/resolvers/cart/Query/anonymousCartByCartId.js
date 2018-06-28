import { decodeCartOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/cart";

/**
 * @name Query.anonymousCartByCartId
 * @method
 * @memberof Cart/GraphQL
 * @summary Get an anonymous cart by Id.
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.cartId - Id of the anonymous cart
 * @param {String} args.token - An anonymous cart token
 * @param {Object} context - An object containing the per-request state
 * @return {Promise<Object>} An AnonymousCart object
 */
export default async function anonymousCartByCartId(parentResult, args, context) {
  const { cartId, token } = args;

  return context.queries.cart.anonymousCartByCartId(context, {
    cartId: decodeCartOpaqueId(cartId),
    token
  });
}
