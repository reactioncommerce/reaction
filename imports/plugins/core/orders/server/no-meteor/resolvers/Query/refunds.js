import { decodeOrderOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/order";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.refunds
 * @method
 * @memberof Order/GraphQL
 * @summary Get refunds applied to an order
 * @param {Object} _ - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.orderId - ID of the order
 * @param {String} args.shopId - shop ID of the order
 * @param {String} [args.token] - An anonymous order token, required if the order was placed without being logged in
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} An Order object
 */
export default async function refunds(_, args, context) {
  const { orderId, shopId, token } = args;

  return context.queries.refunds(context, {
    orderId: decodeOrderOpaqueId(orderId),
    shopId: decodeShopOpaqueId(shopId),
    token
  });
}

