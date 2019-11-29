import setUserPermissions from "./setUserPermissions.js";

/**
 * @name Mutation/addUserPermissions
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver to add user permissions. This is an alias to {@link setUserPermissions.js}
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.groups - The groups the user is to be added to
 * @param {Object} context - an object containing the per-request state
 * @param {Object} args.context.userId - the userId of user to add to the given group
 * @param {Object} args.context.accountId - the userId of account to add to the given groups
 * @returns {Object} - object
 */
export default async function addUserPermissions(_, { input }, context) {
  return setUserPermissions(_, { input }, context);
}
