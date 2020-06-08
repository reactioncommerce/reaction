/**
 * @name customers
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns accounts optionally filtered by group IDs
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise} Mongo cursor
 */
export default async function customers(context) {
  const { collections } = context;
  const { Accounts } = collections;

  await context.validatePermissions("reaction:legacy:accounts", "read");

  return Accounts.find({
    groups: { $in: [null, []] }
  });
}
