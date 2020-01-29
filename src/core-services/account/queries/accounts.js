/**
 * @name accounts
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.groupIds] - Array of group IDs to limit the results
 * @returns {Promise} Mongo cursor
 */
export default async function accounts(context, input) {
  const { collections } = context;
  const { Accounts } = collections;
  const { groupIds } = input;

  await context.validatePermissions("reaction:legacy:accounts", "read");

  const selector = {};
  if (groupIds) {
    selector.groups = { $in: groupIds };
  }

  return Accounts.find(selector);
}
