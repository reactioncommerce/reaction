import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

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
      Groups
    },
    userId
  } = context;

  const groupToRemoveUserFrom = await Groups.findOne({ _id: groupId });
  if (!groupToRemoveUserFrom) throw new ReactionError("not-found", "No group found with that ID");

  const { shopId } = groupToRemoveUserFrom;

  await context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId });

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  const groupToRemove = account.groups.includes(groupId);
  if (!groupToRemove) throw new ReactionError("not-found", "Account not found in this group");

  const allGroupsUserBelongsTo = await Groups.find({ _id: { $in: account.groups } }).toArray();

  // Get all other groups user belongs to, and all permissions from these groups, and flatten into single array
  const remainingGroupsUserBelongsTo = allGroupsUserBelongsTo.filter((group) => group.shopId === shopId && group._id !== groupId);

  const remainingGroupIds = remainingGroupsUserBelongsTo.map((group) => group._id);
  await Accounts.updateOne({ _id: accountId }, { $set: { groups: remainingGroupIds } });

  const updatedAccount = {
    ...account,
    groups: remainingGroupsUserBelongsTo
  };

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["groups"]
  });

  // Return the group the account was added to
  return allGroupsUserBelongsTo.find((group) => group._id === groupId);
}
