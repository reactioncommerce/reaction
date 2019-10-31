/**
 * @name shopAdministrators
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary return Account object for all users who are "owner" or "admin" role for the shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - ID of shop
 * @returns {Object[]} Array of user account objects
 */
export default async function shopAdministratorsQuery(context, id) {
  const { checkPermissionsLegacy, collections } = context;
  const { Accounts, users: Users } = collections;

  // TODO: pod-auth - not sure what do here with permissions
  await checkPermissionsLegacy(["owner", "admin"], id);

  const users = await Users.find({
    [`roles.${id}`]: "admin"
  }, {
    projection: { _id: 1 }
  }).toArray();
  const userIds = users.map(({ _id }) => _id);

  return Accounts.find({ _id: { $in: userIds } });
}
