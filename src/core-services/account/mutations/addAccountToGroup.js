import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

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
      Groups
    },
    userId
  } = context;

  const groupToAddUserTo = await Groups.findOne({ _id: groupId });
  if (!groupToAddUserTo) throw new ReactionError("not-found", "No group found with that ID");

  await context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId: groupToAddUserTo.shopId });

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  const groupToAdd = account.groups.includes(groupId);
  if (groupToAdd) throw new ReactionError("group-found", "Account is already in this group");

  // Add new group to Account
  const accountGroups = Array.isArray(account.groups) ? account.groups : [];
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
