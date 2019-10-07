/**
 * @name Query.shopBySlug
 * @method
 * @memberof Shop/GraphQL
 * @summary query the Shops collection and return shop data
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.slug - slug of shop to query
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} shop object
 */
export default async function shopBySlug(_, { slug }, context) {
  return context.queries.shopBySlug(context, slug);
}
