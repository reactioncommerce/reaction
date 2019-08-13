import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Query.orderByReferenceId
 * @method
 * @memberof Order/GraphQL
 * @summary Get an order by its reference ID
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.id - reference ID of the order
 * @param {String} args.shopId - shop ID of the order
 * @param {String} [args.token] - An anonymous order token, required if the order was placed without being logged in
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} An Order object
 */
export default async function orderByReferenceId(parentResult, args, context) {
  const { id, shopId, token } = args;

  return context.queries.orderByReferenceId(context, {
    orderReferenceId: id,
    shopId: decodeShopOpaqueId(shopId),
    token
  });
}
