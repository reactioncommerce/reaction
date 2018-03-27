import { getPaginatedAccountResponse } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name administrators
 * @method
 * @summary find and return the administrators (users with "admin" or "owner" role) for a shop
 * @param {Object} shop - The shop object returned by the parent resolver
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.after - Connection argument
 * @param {String} args.before - Connection argument
 * @param {Number} args.first - Connection argument
 * @param {Number} args.last - Connection argument
 * @param {Object} context - an object containing the per-request state
 * @return {Object[]} Promise that resolves with array of user account objects
 */
export default async function administrators(shop, connectionArgs, context) {
  // Transform ID from base64
  const dbShopId = decodeShopOpaqueId(shop._id);

  const query = await context.queries.shopAdministrators(context, dbShopId);
  return getPaginatedAccountResponse(query, connectionArgs);
}
