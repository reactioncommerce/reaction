import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import canAddAccountToGroup from "../util/canAddAccountToGroup.js";
import ensureRoles from "../util/ensureRoles.js";

const inputSchema = new SimpleSchema({
  accountId: String,
  groupId: String
});

/**
 * @name accounts/removeAccountFromGroup
 * @memberof Mutations/Accounts
 * @method
 * @summary Add an account to a group
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments
 * @param {String} input.accountId - The account ID
 * @param {String} input.groupId - The group ID
 * @return {Promise<Object>} with updated address
 */
export default async function removeAccountFromGroup(context, input) {
  inputSchema.validate(input);

  const { accountId, groupId } = input;
  const {
    appEvents,
    collections: {
      Accounts,
      Groups,
      users
    },
    userId
  } = context;

  const groupToRemoveUserFrom = await Groups.findOne({ _id: groupId });
  if (!groupToRemoveUserFrom) throw new ReactionError("not-found", "No group found with that ID");

  const { shopId } = groupToRemoveUserFrom;

  const isAllowed = await canAddAccountToGroup(context, groupToRemoveUserFrom);
  if (!isAllowed) throw new ReactionError("access-denied", "Access Denied");

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  const accountUser = await users.findOne({ _id: account.userId });
  if (!accountUser) throw new ReactionError("not-found", "No user found with that ID");

  // Get all other groups user belongs to, and all permissions from these groups
  const otherGroupsUserBelongsTo = account.groups.filter((group) => group.shopId === shopId && group._id !== groupId);

  let otherGroupPermissions;
  if (Array.isArray(otherGroupsUserBelongsTo) && otherGroupsUserBelongsTo.length) {
    const otherGroups = await Groups.find({ _id: { $in: otherGroupsUserBelongsTo } }).toArray();
    otherGroupPermissions = _.uniq(otherGroups.map((group) => group.permissions).flat());
  }

  // update user to only have roles from other groups they belong
  // TODO(pod-auth): this will likely be removed in #6031, where we no longer get roles from user.roles
  await ensureRoles(context, otherGroupPermissions || []);
  await users.updateOne({
    _id: account.userId
  }, {
    $set: {
      [`roles.${shopId}`]: otherGroupPermissions || []
    }
  });
  // TODO(pod-auth): this will likely be removed in #6031, where we no longer get roles from user.roles

  await Accounts.updateOne({ _id: accountId }, { $set: { groups: otherGroupsUserBelongsTo } });

  const updatedAccount = {
    ...account,
    groups: otherGroupsUserBelongsTo
  };

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["groups"]
  });

  // Return the group the account was added to
  return Groups.findOne({ _id: groupId });
}
