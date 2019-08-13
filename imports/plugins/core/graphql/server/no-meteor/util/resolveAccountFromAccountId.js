/**
 * @name resolveAccountFromAccountId
 * @method
 * @memberof GraphQL/ResolverUtilities
 * @summary A generic resolver that gets the account object for the provided parent result, assuming it has a `accountId` property
 * @param {Object} parent - result of the parent resolver
 * @param {Object} _ - unused param
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} The account having ID parent.accountId, in GraphQL schema format
 */
export default async function resolveAccountFromAccountId(parent, _, context) {
  const { accountId } = parent;
  if (!accountId) return null;

  return context.queries.userAccount(context, accountId);
}
