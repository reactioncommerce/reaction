import { Meteor } from "meteor/meteor";
import { Accounts } from "/lib/collections";
import { Reaction } from "/lib/api";

/**
 * @name shopAdministratorsQuery
 * @method
 * @summary return Account object for all users who are "owner" or "admin" role for the shop
 * @param {Object} context - an object containing the per-request state
 * @param {String} id - ID of shop
 * @return {Object[]} Array of user account objects
 */
export async function shopAdministratorsQuery(context, id) {
  const { userId } = context;

  if (!Reaction.hasPermission(["owner", "admin"], userId, id)) throw new Meteor.Error("access-denied", "User does not have permission");

  const userIds = Meteor.users.find({
    [`roles.${id}`]: "admin"
  }, {
    fields: { _id: 1 }
  }).map(({ _id }) => _id);

  return Accounts.rawCollection().find({ _id: { $in: userIds } });
}
