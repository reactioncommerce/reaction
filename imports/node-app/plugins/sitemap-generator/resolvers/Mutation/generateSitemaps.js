/**
 * @name Mutation.generateSitemaps
 * @method
 * @memberof Sitemap/GraphQL
 * @summary resolver for the generateSitemaps GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Boolean>} true on success
 */
export default async function generateSitemaps(parentResult, { input = {} }, context) {
  const { clientMutationId = null } = input;

  await context.mutations.generateSitemaps(context);

  return {
    wasJobScheduled: true,
    clientMutationId
  };
}
