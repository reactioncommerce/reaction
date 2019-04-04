/**
 * @name Query.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get system information for reaction site
 * @param {ConnectionArgs} args An object of all arguments that were sent by the client
 * @param {String} args.shopId The ID of the shop to load navigation items for
 * @param {Object} context An object containing the per-request state
 * @return {<Object>} System Information Object
 */
export default async function systemInformation(_, args, context) {
  return context.queries.systemInformation(context);
}
