/**
 * @name Group/createdBy
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return user account data
 * @param {Object} args - an object of all arguments that were sent by the previous resolver
 * @param {Object} args.createdBy - a string account id
 * @param {Object} _ - unused
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} user account object
 */
export default function createdBy({ createdBy: createdByAccountId }, _, context) {
  if (!createdByAccountId) return null;
  return context.queries.userAccount(context, createdByAccountId);
}
