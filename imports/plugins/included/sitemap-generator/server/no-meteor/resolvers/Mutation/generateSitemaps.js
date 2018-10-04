/**
 * @name Mutation.generateSitemaps
 * @method
 * @memberof Sitemap/GraphQL
 * @summary resolver for the generateSitemaps GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Boolean>} true on success
 */
export default async function generateSitemaps(parentResult, args, context) {
  await context.mutations.generateSitemaps(context);
  return true;
}
