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
 * @name accounts/addAccountToGroup
 * @memberof Mutations/Accounts
 * @method
 * @summary Add an account to a group
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments
 * @param {String} input.accountId - The account ID
 * @param {String} input.groupId - The group ID
 * @return {Promise<Object>} with updated address
 */
export default async function addAccountToGroup(context, input) {
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

  const groupToAddUserTo = await Groups.findOne({ _id: groupId });
  if (!groupToAddUserTo) throw new ReactionError("not-found", "No group found with that ID");

  const { permissions: groupPermissions = [], shopId } = groupToAddUserTo;

  const isAllowed = await canAddAccountToGroup(context, groupToAddUserTo);
  if (!isAllowed) throw new ReactionError("access-denied", "Access Denied");

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  const accountUser = await users.findOne({ _id: account.userId });
  if (!accountUser) throw new ReactionError("not-found", "No user found with that ID");

  // Get existing roles from a user
  const newAccountUserRoles = new Set((accountUser.roles || {})[shopId] || []);

  // Merge existing roles on user and roles from new group
  // TODO(pod-auth): this will likely be removed in #6031, where we no longer get roles from user.roles
  const newRoles = [...newAccountUserRoles, ...groupPermissions];
  const uniqueRoles = _.uniq(newRoles);

  // Add all group roles to the user. Make sure this stays in this order.
  const newAccountUserRolesArray = [...newAccountUserRoles];
  await ensureRoles(context, newAccountUserRolesArray);
  await users.updateOne({
    _id: account.userId
  }, {
    $set: {
      [`roles.${shopId}`]: uniqueRoles
    }
  });
  // TODO(pod-auth): this will likely be removed in #6031, where we no longer get roles from user.roles

  // Add new group to Account
  const accountGroups = (Array.isArray(account.groups) && account.groups) || [];
  accountGroups.push(groupId);

  await Accounts.updateOne({ _id: accountId }, { $set: { groups: accountGroups } });

  const updatedAccount = {
    ...account,
    groups: accountGroups
  };

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["groups"]
  });

  // Return the group the account was added to
  return Groups.findOne({ _id: groupId });
}
