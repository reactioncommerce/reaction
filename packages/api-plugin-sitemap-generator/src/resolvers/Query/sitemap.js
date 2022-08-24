/**
 * @name Query/sitemap
 * @method
 * @memberof SitemapGenerator/GraphQL
 * @summary resolver for the sitemap GraphQL query
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.handle - The name of the sitemap
 * @param {String} args.shopUrl - The base URL of the shop
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info Info about the GraphQL request
 * @returns {Promise<Object>|undefined} A Sitemap object
 */
export default async function surcharges(parentResult, args, context) {
  const { handle, shopUrl } = args;

  return context.queries.sitemap(context, {
    handle,
    shopUrl
  });
}
