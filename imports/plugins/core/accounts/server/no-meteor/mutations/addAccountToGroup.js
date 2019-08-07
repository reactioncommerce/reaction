import ReactionError from "@reactioncommerce/reaction-error";
import { difference } from "lodash";
import SimpleSchema from "simpl-schema";
import ensureRoles from "../util/ensureRoles";

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
    user
  } = context;

  const group = await Groups.findOne({ _id: groupId });
  if (!group) throw new ReactionError("not-found", "No group found with that ID");

  const { permissions: groupPermissions = [], shopId } = group;

  // An account can add another account to a group as long as the person adding
  // has all permissions granted by that group.
  // We can't use `userHasPermission` here because we want to make sure they
  // have ALL the permissions rather than ANY.
  if (!context.isInternalCall && difference(groupPermissions, user.roles[shopId] || []).length > 0) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "No account found with that ID");

  // Add all group roles to the user
  await ensureRoles(context, groupPermissions);
  await users.updateOne({
    _id: account.userId
  }, {
    $addToSet: {
      [`roles.${shopId}`]: {
        $each: groupPermissions
      }
    }
  });

  // Save updated groups list, making sure user only belongs to one group per shop
  const allGroupsInShop = await Groups.find({
    shopId
  }, {
    projection: {
      _id: 1
    }
  }).toArray();
  const allGroupIDsInShop = allGroupsInShop.map((grp) => grp._id);
  const newGroups = (account.groups || []).filter((grp) => allGroupIDsInShop.indexOf(grp) === -1);
  newGroups.push(groupId);
  await Accounts.updateOne({ _id: accountId }, { $set: { groups: newGroups } });

  const updatedAccount = {
    ...account,
    groups: newGroups
  };

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: user._id,
    updatedFields: ["groups"]
  });

  // Return the group the account was added to
  return Groups.findOne({ _id: groupId });
}
