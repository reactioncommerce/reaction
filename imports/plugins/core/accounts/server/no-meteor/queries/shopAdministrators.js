import ReactionError from "@reactioncommerce/reaction-error";

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
  const { collections, userHasPermission } = context;
  const { Accounts, users: Users } = collections;

  if (!userHasPermission(["owner", "admin"], id)) throw new ReactionError("access-denied", "User does not have permission");

  const users = await Users.find({
    [`roles.${id}`]: "admin"
  }, {
    fields: { _id: 1 }
  }).toArray();
  const userIds = users.map(({ _id }) => _id);

  return Accounts.find({ _id: { $in: userIds } });
}
