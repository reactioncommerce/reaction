import { decodeOrderOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Query.orderById
 * @method
 * @memberof Order/GraphQL
 * @summary Get an order by ID.
 * @param {Object} parentResult - unused
 * @param {ConnectionArgs} args - An object of all arguments that were sent by the client
 * @param {String} args.id - ID of the order
 * @param {String} [args.token] - An anonymous order token, required if the order was placed without being logged in
 * @param {Object} context - An object containing the per-request state
 * @returns {Promise<Object>|undefined} An Order object
 */
export default async function orderById(parentResult, args, context) {
  const { id, shopId, token } = args;

  return context.queries.orderById(context, {
    orderId: decodeOrderOpaqueId(id),
    shopId: decodeShopOpaqueId(shopId),
    token
  });
}
